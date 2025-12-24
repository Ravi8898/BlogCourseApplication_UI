import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormService } from 'src/app/common/services/from.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-retention',
  templateUrl: './retention.component.html',
  styleUrls: ['./retention.component.scss']
})
export class RetentionComponent {
  columns: any[] = [];
  isLoader: boolean = false;
  advanceTypeDetails: any[] = []
  successPopup: boolean = false;
  popupMessage: string = '';
  retentionModal: boolean = false;
  retentionForm: any;
  submitted: boolean = false;
  errorMessage: string = '';
  isUpdated: boolean = false;
  isEdit: boolean = false;
  originalFormValues: any;
  advanceTypeId: number = 0;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private formService: FormService

  ) {
    this.columns = [
      { field: 'retentionName', header: 'Retention Type' },
      { field: 'retentionPercentage', header: 'Percentage (%)' },
      // { field: 'remark', header: 'Remark' }
      { field: 'action', header: 'Action', value: ['edit'] }
    ];

    this.retentionForm = this.fb.group({
      retentionName: ['', Validators.required],
      retentionPercentage: ['', Validators.required],
      // remark: ['']
    });
  }

  ngOnInit() {
    this.getAdvanceTypeDetails();
    this.retentionForm.valueChanges.subscribe(() => {
      if (this.isEdit) {
        this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.retentionForm);
      }
    });
  }

  getAdvanceTypeDetails() {
    this.isLoader = true;
    const url = 'master/getRetention';
    let params = {
      "id": 0
    }
    this.apiService.dataPost(url, params).subscribe((response: any) => {
      this.advanceTypeDetails = response.data;
      this.isLoader = false;
    }, (error) => {
      console.error('Error fetching advance type details:', error);
      this.isLoader = false;
    });
  }

  openRetentionModal() {
    this.retentionModal = true;
  }

  closeRetentionModal() {
    this.retentionModal = false;
  }

  saveData() {
    this.submitted = true;
    if (this.retentionForm.invalid) {
      return;
    }

    const formData = this.retentionForm.value;
    let url = 'master/addRetention';
    let params = {
      "retentionId": this.isEdit ? this.advanceTypeId : 0,
      "retentionName": formData.retentionName,
      "retentionPercentage": formData.retentionPercentage,
      "isActive": true,
      "loginuser": this.apiService.getUserName()
      // "remark": formData.remark
    };
    this.isLoader = true;
    this.apiService.dataPost(url, params).subscribe((response: any) => {

      this.popupMessage = this.isEdit ? 'Retention updated successfully' : 'Retention added successfully';
      this.successPopup = true;
      this.getAdvanceTypeDetails();
      this.closeRetentionModal();
      this.resetForm();
      setTimeout(() => {
        this.successPopup = false;
      }, 2000);
      this.isLoader = false;

    }, (error) => {
      console.error('Error saving retention:', error);
      this.errorMessage = 'An error occurred while saving the retention.';
      this.isLoader = false
      this.submitted = false;
    });
  }

  resetForm() {
    this.retentionForm.reset();
    this.submitted = false;
    this.errorMessage = '';
    this.isEdit = false;
    this.isUpdated = false;
  }

  onEdit(rowData: any) {
    this.isEdit = true;
    this.advanceTypeId = rowData.retentionId;
    this.retentionForm.patchValue({
      retentionName: rowData.retentionName,
      retentionPercentage: rowData.retentionPercentage,
      // remark: rowData.remark
    });
    this.originalFormValues = this.retentionForm.value
    this.isUpdated = this.formService.isFormUpdated(this.originalFormValues, this.retentionForm);
    this.openRetentionModal();
  }
  onDelete(rowData: any) {
  }
}
