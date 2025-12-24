import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-department-approvers',
  templateUrl: './department-approvers.component.html',
  styleUrls: ['./department-approvers.component.scss']
})
export class DepartmentApproversComponent {
  isLoader: boolean = false;
  successPopup: boolean = false;
  isAddDeptApproversModelOpen: boolean = false
  isUpdated: boolean = false;
  isEdit: boolean = false
  submitted: boolean = false;
  popupMessage: string = '';
  errorMessage: string = ''
  rowId: number = 0
  originalValues: any = {}
  departmentApproversList: any[] = []
  users: any[] = []
  validationForList: any[] = []
  DepartmentValidationList: any[] = []
  roles: any[] = []
  departmentValidationId: number = 0;
  validationAfterList: any[] = []
  columns = [
    { header: 'Department Validation', field: 'departmentname' },
    { header: 'User', field: 'username' },
    { header: 'Display Name', field: 'displayname' },
    { header: 'Role', field: 'rolename' },
    { header: 'Validation Level', field: 'validationlevel' },
    { header: 'Validation For', field: 'validateafter' },
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
  selectedUser: any;
  history: any[] = [];
  historyModal: boolean = false;

  constructor(private fb: FormBuilder, private fs: FormService, private apiService: ApiService) {
    this.approversForm = this.fb.group({
      userId: [null, Validators.required],
      displayName: [null, Validators.required],
      roleId: [null, Validators.required],
      validationLevelId: [null, Validators.required],
      // validationFor: [null, Validators.required],
      deptValidation: [null, Validators.required],
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
    this.getdepartmentApproversList();
    this.getUsersDropDownList()
    this.getRolesDropDownList()
    this.getValidationForDropDownList()
    this.getDeptValidationDropDownList()
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
      } else if (value == 2 || value === 3) {
        this.approversForm.get('validationAfter')?.enable();
        this.getdepartmentApproversList();
      }
    });
  }
  onEdit(item: any) {
    this.isEdit = true;
    this.isAddDeptApproversModelOpen = true;
    this.departmentValidationId = item.departmentvalidationid
    const UserGet = this.users.find(
      (type: any) => type.userName === item.username
    );
    const RoleGet = this.roles.find(
      (type: any) => type.roleName === item.rolename
    );
    const ForlistGet = this.validationForList.find(
      (type: any) => type.validationlebel === item.validationlabel
    );
    const DeptGet = this.DepartmentValidationList.find(
      (type: any) => type.departmentName === item.departmentname
    );
    this.approversForm.patchValue({
      userId: UserGet.userId,
      displayName: item.displayname,
      roleId: RoleGet.roleId,
      validationLevelId: item.validationlevel,
      // validationFor: ForlistGet?.validationforid,
      deptValidation: DeptGet.departmentId,
      validationAfter: item.validateafter
    })
    this.originalValues = this.approversForm.value;
    this.isUpdated = this.fs.isFormUpdated(this.originalValues, this.approversForm)
  }


  onDelete(value: any) {
    console.log('Delete', value);
    let json = {
      'id': value.departmentvalidationid,
      'isActive': false,
      'loginuser': this.apiService.getUserName()
    }
    this.apiService.dataPost('contract/deleteDepartmentValidation', json).subscribe(response => {
      this.getdepartmentApproversList()
    }, error => {
      console.log('Error while deleting data', error);
    });
  }
  saveData() {
    console.log('hello create');

    this.fs.trimFormValues(this.approversForm)
    if (this.approversForm.invalid) {
      this.approversForm.markAllAsTouched()
      return
    }
    let formData = this.approversForm.value;
    console.log('formdata', formData)
    let json = {
      "departmentValidationId": this.departmentValidationId ? this.departmentValidationId : 0,
      // "fkValidationForId": formData.validationFor,
      "fkDepartmentId": formData.deptValidation,
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
    this.apiService.dataPost('contract/setDepartmentValidation', json).subscribe(
      response => {
        console.log('Data saved successfully', response);
        this.successPopup = true;
        this.popupMessage = this.isEdit ? 'Department Approvers Updated Successfully' : 'Department Approvers Added Successfully'
        this.isLoader = false
        this.closeApproversModal()
        this.getdepartmentApproversList()
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
    this.approversForm.reset();
  }
  closeApproversModal() {
    this.isAddDeptApproversModelOpen = false;
    this.isEdit = false;
    this.resetForm()
  }
  openApproversModal() {
    this.isAddDeptApproversModelOpen = true;
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
  getdepartmentApproversList() {
    const data = {
      "contractid": this.contractId,
    }
    this.apiService.dataPost('contract/getDepartmentValidation', data).subscribe(
      (response: any) => {
        this.departmentApproversList = response?.data
        this.validationAfterList = response?.data
      },
      error => {
        console.log('Error :', error);
      });
  }

  getRolesDropDownList() {
    this.apiService.dataGet('contract/getRoleDetails').subscribe(
      (response: any) => {
        this.roles = response?.data?.filter((role: any) => role.roleName !== 'Final Approver' && role.roleName !== 'Viewer');
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
  getDeptValidationDropDownList() {
    this.apiService.dataPost('master/getActiveAndInactiveDepartmentList/true', {}).subscribe(
      (response: any) => {
        this.DepartmentValidationList = response?.data

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
