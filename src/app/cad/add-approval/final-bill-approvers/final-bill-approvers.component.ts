import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-final-bill-approvers',
  templateUrl: './final-bill-approvers.component.html',
  styleUrls: ['./final-bill-approvers.component.scss']
})
export class FinalBillApproversComponent {
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
  columns = [
    { header: 'User', field: 'username' },
    { header: 'Display Name', field: 'displayname' },
    { header: 'Role', field: 'rolename' },
    { header: 'Validation Level', field: 'validationlevel' },
    { header: 'Validation For', field: 'validationlabel' },
    { header: 'Validation After', field: 'validateafter' },
    { header: 'Assign History', field: 'action' },
    { header: 'Action', field: 'action', value: ['edit', 'delete'] }
  ]

  FinalBillApproversList: any[] = []
  // FinalBillApproversList = [

  //   {
  //     "id": 1,
  //     "validationAfter": "HR",
  //     "validationAfterId": 1,
  //     "user": "Rahul Joshi",
  //     "userId": 1,
  //     "displayName": "XYZ ABC",
  //     "displayNameId": 1,
  //     "role": "Reviewer",
  //     "roleId": 2,
  //     "validationLevel": "01",
  //     "validationLevelId": 1,
  //     "validationFor": "order value upto 10 lakh",
  //     "validationForId": 1
  //   },
  //   {
  //     "id": 2,
  //     "validationAfter": "Finance",
  //     "validationAfterId": 2,
  //     "user": "Amit Patel",
  //     "userId": 2,
  //     "displayName": "DEF GHI",
  //     "displayNameId": 2,
  //     "role": "Approver",
  //     "roleId": 1,
  //     "validationLevel": "02",
  //     "validationLevelId": 2,
  //     "validationFor": "order value above 10 lakh",
  //     "validationForId": 2
  //   },
  //   {
  //     "id": 3,
  //     "validationAfter": "Procurement",
  //     "validationAfterId": 1,
  //     "user": "Sneha Shah",
  //     "userId": 3,
  //     "displayName": "JKL MNO",
  //     "displayNameId": 1,
  //     "role": "Manager",
  //     "roleId": 3,
  //     "validationLevel": "03",
  //     "validationLevelId": 2,
  //     "validationFor": "bulk orders above 50 lakh",
  //     "validationForId": 1
  //   }
  // ]

  users: any[] = []
  // users:any[] = [
  //   {id:1,name:'Rahul Joshi'},
  //   {id:2,name: 'Hetal Kalaswa'}
  // ]

  // displayNames:any[]=[
  //   {id:1,name:'ABC'},
  //   {id:2,name: 'XYZ'}
  // ]

  roles: any[] = []
  // roles:any[] = [
  //   { id:1,name:'Reviewer'},
  //   { id:2,name:'Approvers'}
  // ]

  validationLevelList: any[] = [
    // { id: 0, name: '0' },
    { id: 1, name: '1' },
    { id: 2, name: '2' },
    { id: 3, name: '3' }
  ]

  validationForList: any[] = []
  // validationForList:any[] = [
  //   { id:1,name:'Reviewer'},
  //   { id:2,name:'Approvers'}
  // ]

  validationAfterList: any[] = []
  // validationAfterList:any[] = [
  //   { id:1,name:'Reviewer'},
  //   { id:2,name:'Approvers'}
  // ]

  approversForm!: FormGroup;
  billValidationId: number = 0;
  contractId: string = '';
  history: any[] = [];
  historyModal: boolean = false;

  constructor(private fb: FormBuilder, private fs: FormService, private apiService: ApiService) {
    this.approversForm = this.fb.group({
      userId: [null, Validators.required],
      displayName: [null, Validators.required],
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
    this.getFinalBillApprovalList()
    this.getUsersDropDownList()
    this.getRolesDropDownList()
    this.getValidationForDropDownList()
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
        this.getFinalBillApprovalList();
      }
    });
  }
  getFinalBillApprovalList() {
    const data = {
      "contractid": this.contractId,
    }
    this.apiService.dataPost('contract/getCJPCValidation', data).subscribe(
      (response: any) => {
        this.FinalBillApproversList = response?.data.filter((item: any) => item.rolename == 'Final Approver' );
        this.validationAfterList = response?.data
      },
      error => {
        console.log('Error :', error);
      });
  }
  resetForm() {
    this.errorMessage = '';
    this.billValidationId = 0
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
  onEdit(item: any) {
    this.isEdit = true;
    this.billValidationId = item.cjpcvalidationid
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
      validationAfter: item.validateafter
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
      this.getFinalBillApprovalList()
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
      "cjpcValidationId": this.billValidationId ? this.billValidationId : 0,
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
        this.popupMessage = this.isEdit ? 'Final Bill Approvers Updated Successfully' : 'Final Bill Approvers Added Successfully'
        this.isLoader = false
        this.closeApproversModal()
        this.getFinalBillApprovalList()
      },
      error => {
        console.log('Error while saving data', error);
        this.errorMessage = error?.error?.message
        this.isLoader = false
      }
    )
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
  // getDisplayNamesDropDownList() {
  //   this.apiService.dataPost('contract/getUsersList', {}).subscribe(
  //     (response: any) => {
  //       this.displayNames = response?.data
  //     },
  //     error => {
  //       console.log('Error :', error);
  //     });
  // }

  getRolesDropDownList() {
    this.apiService.dataGet('contract/getRoleDetails').subscribe(
      (response: any) => {
        this.roles = response?.data?.filter((role: any) => role.roleName === 'Final Approver');
        // this.roles = response?.data;
        // console.log(this.roles);
        
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
  getValidationAfterDropDownList() {
    this.apiService.dataGet('contract/getUsersList').subscribe(
      (response: any) => {
        this.validationAfterList = response?.data
      },
      error => {
        console.log('Error :', error);
      });
  }
  getValidationLevelDropDownList() {
    this.apiService.dataPost('contract/getUsersList', {}).subscribe(
      (response: any) => {
        this.validationLevelList = response?.data
      },
      error => {
        console.log('Error :', error);
      });
  }

    rowClick(event: any) {
    console.log('Row Clicked:', event);
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
