import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-cjpc-approvers',
  templateUrl: './cjpc-approvers.component.html',
  styleUrls: ['./cjpc-approvers.component.scss']
})
export class CJPCApproversComponent {
  isLoader: boolean = false;
  successPopup: boolean = false;
  isAddApproversModelOpen: boolean = false
  isUpdated: boolean = false;
  isEdit: boolean = false
  submitted: boolean = false;
  popupMessage: string = '';
  errorMessage: string = ''
  rowId: number = 0
  originalValues: any = {}
  users: any[] = []
  roles: any[] = []
  validationForList: any[] = []
  CJPCApproversList: any[] = []
  validationAfterList: any[] = []
  cjpcValidationId: number = 0;
  columns = [
    { header: 'User', field: 'username' },
    { header: 'Display Name', field: 'displayname' },
    { header: 'Role', field: 'rolename' },
    { header: 'Validation Level', field: 'validationlevel' },
    { header: 'Validation For', field: 'validationlabel' },
    { header: 'Validation After', field: 'validateafter' },
    { header: 'Assign History', field: '' },
    { header: 'Action', field: 'action', value: ['edit', 'delete'] }
  ]
  validationLevelList: any[] = [
    // { id: 0, name: '0' },
    { id: 1, name: '1' },
    { id: 2, name: '2' },
    { id: 3, name: '3' }
  ]
  approversForm!: FormGroup;
  contractId: string = '';
  historyModal: boolean = false;
  history: any[] = [];

  constructor(private fb: FormBuilder, private fs: FormService, private apiService: ApiService) {
    this.approversForm = this.fb.group({
      userId: [null, Validators.required],
      displayName: [this.approversForm, Validators.required],
      roleId: [null, Validators.required],
      validationLevelId: [null, Validators.required],
      validationFor: [null, Validators.required],
      validationAfter: [null, Validators.required],
      remark: [null],
    })
  }

  getContractId(): string {
    this.contractId = localStorage.getItem('contractId') || '';
    return this.contractId;
  }

  ngOnInit() {
    this.getContractId();
    this.getUsersDropDownList()
    this.getRolesDropDownList()
    this.getValidationForDropDownList()
    this.getCJPCApproversList()
    this.approversForm.valueChanges.subscribe(() => {
      if (this.isEdit) {
        this.isUpdated = this.fs.isFormUpdated(this.originalValues, this.approversForm);
      }
    })
    this.approversForm.get('userId')?.valueChanges.subscribe(userId => {
      const selectedUser = this.users.find(user => user.userId === userId);
      if (selectedUser) {
        this.approversForm.patchValue({ displayName: selectedUser.userName });
      } else {
        this.approversForm.patchValue({ displayName: '' });
      }
    });
    this.approversForm.get('validationLevelId')?.valueChanges.subscribe(value => {
      if (value === 0 || value === 1) {
        this.approversForm.get('validationAfter')?.disable();
      } else if (value === 2 || value === 3) {
        this.approversForm.get('validationAfter')?.enable();
        this.getCJPCApproversList();
      }
    });
  }
  onEdit(item: any) {
    this.isEdit = true;
    this.cjpcValidationId = item.cjpcvalidationid
    this.isAddApproversModelOpen = true;
    const UserGet = this.users.find(
      (type: any) => type.userName === item.username
    );
    const RoleGet = this.roles.find(
      (type: any) => type.roleName === item.rolename
    );
    const ForlistGet = this.validationForList.find(
      (type: any) => type.validationlebel === item.validationlabel
    );
    this.approversForm.patchValue({
      userId: UserGet.userId,
      displayName: item.displayname,
      roleId: RoleGet.roleId,
      validationLevelId: item.validationlevel,
      validationFor: ForlistGet.validationforid,
      validationAfter: item.validateafter,
      remark: item.remark ? item.remark : ''
    })
    this.originalValues = this.approversForm.value;
    this.isUpdated = this.fs.isFormUpdated(this.originalValues, this.approversForm)
  }
  onDelete(value: any) {
    console.log('Delete', value);
    let json = {
      'id': value.cjpcvalidationid,
      'isActive': false,
      'loginuser': this.apiService.getUserName()
    }
    this.apiService.dataPost('contract/deleteCJPCValidation', json).subscribe(response => {
      ;
      this.getCJPCApproversList()
    }, error => {
      console.log('Error while deleting data', error);
    });
  }
  saveData() {
    this.fs.trimFormValues(this.approversForm)
    if (this.approversForm.invalid) {
      this.approversForm.markAllAsTouched()
      return
    }
    let formData = this.approversForm.value;
    let json = {
      "cjpcValidationId": this.cjpcValidationId ? this.cjpcValidationId : 0,
      "fkValidationForId": formData.validationFor,
      "fkContractId": this.contractId,
      "fkRoleMasterId": formData.roleId,
      "fkUserId": formData.userId,
      "displayName": formData.displayName,
      "validationLevel": formData.validationLevelId,
      "validateAfter": formData.validationAfter ? formData.validationAfter : '',
      "isActive": true,
      "loginuser": this.apiService.getUserName(),
      "remark": formData.remark ? formData.remark : ''
    }
    this.isLoader = true
    this.apiService.dataPost('contract/setCJPCValidation', json).subscribe(
      response => {
        console.log('Data saved successfully', response);
        this.successPopup = true;
        this.popupMessage = this.isEdit ? 'CJPC Approvers Updated Successfully' : 'CJPC Approvers Added Successfully'
        this.isLoader = false
        this.closeApproversModal()
        this.getCJPCApproversList()
      },
      error => {
        console.log('Error while saving data', error);
        this.errorMessage = error?.error?.message
        this.isLoader = false
      }
    )


  }
  resetForm() {
    this.errorMessage = '';
    this.cjpcValidationId = 0;
    this.approversForm.reset();
  }
  closeApproversModal() {
    this.isAddApproversModelOpen = false;
    this.isEdit = false;
    this.resetForm()
  }
  openApproversModal() {
    this.isAddApproversModelOpen = true;
  }
  getUsersDropDownList() {
    this.apiService.dataGet('contract/getUSerDetails').subscribe(
      (response: any) => {
        this.users = response?.data
      },
      error => {
        console.log('Error :', error);
      });
  }

  getRolesDropDownList() {
    this.apiService.dataGet('contract/getRoleDetails').subscribe(
      (response: any) => {
        this.roles = response?.data?.filter((role: any) => role.roleName !== 'Final Approver' && role.roleName !== 'Reviewer');
      },
      error => {
        console.log('Error :', error);
      });
  }
  getValidationForDropDownList() {
    this.apiService.dataGet('contract/getValidationDetails').subscribe(
      (response: any) => {
        this.validationForList = response?.data
      },
      error => {
        console.log('Error :', error);
      });
  }
  getCJPCApproversList() {
    const data = {
      "contractid": this.contractId,
    }
    this.apiService.dataPost('contract/getCJPCValidation', data).subscribe(
      (response: any) => {
        this.CJPCApproversList = response?.data.filter((item: any) => item.rolename !== 'Final Approver');
        this.validationAfterList = response?.data
      },
      error => {
        console.log('Error :', error);
      });
  }

  rowClick(event: any) {
    // console.log('Row Clicked:', event);
    if (event?.columnName == 'Assign History') {
      this.history = event.rowData?.history;
      // console.log('Assign History clicked for row:', rowData);

      this.historyModal = true;
    }
  }

  closeHistoryModal() {
    this.historyModal = false;
  }

}

