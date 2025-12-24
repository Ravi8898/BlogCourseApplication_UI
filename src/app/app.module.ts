import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';

import { ObserversModule } from "@angular/cdk/observers";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FileUploadModule } from 'ng2-file-upload';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NgxSpinnerModule } from "ngx-spinner";
import { ToastrModule } from 'ngx-toastr';
import { AddBillComponent } from './All-Master/add-bill/add-bill.component';
import { AddFiDataComponent } from './All-Master/add-fi-data';
import { AddFrieghtBillComponent } from './All-Master/add-frieght-bill/add-frieght-bill.component';
import { AllBreadcrumbComponent } from './All-Master/all-breadcrumb/all-breadcrumb.component';
import { AllMasterDataComponent } from './All-Master/all-master-data/all-master-data.component';
import { AllTrackingTimelineComponent } from './All-Master/all-tracking-timeline/all-tracking-timeline.component';
import { DeleteModalComponent } from './All-Master/delete-modal/delete-modal.component';
import { FrieghtmasterComponent } from './All-Master/frieghtmaster/frieghtmaster.component';
import { MasterAdTableComponent } from './All-Master/master-ad-table/master-ad-table.component';
import { MasterAdminDashboardComponent } from './All-Master/master-admin-dashboard/master-admin-dashboard.component';
import { MasterToastMsgComponent } from './All-Master/master-toast-msg/master-toast-msg.component';
import { NavbarComponent } from './All-Master/navbar/navbar.component';
import { AngularMaterialModule } from './angular-material/angular-material.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddApprovalComponent } from './cad/add-approval/add-approval.component';
import { CJPCApproversComponent } from './cad/add-approval/cjpc-approvers/cjpc-approvers.component';
import { DepartmentApproversComponent } from './cad/add-approval/department-approvers/department-approvers.component';
import { FinalBillApproversComponent } from './cad/add-approval/final-bill-approvers/final-bill-approvers.component';
import { AddContractComponent } from './cad/add-contract/add-contract.component';
import { ContractInformationComponent } from './cad/add-contract/contract-information/contract-information.component';
import { StatutoryComplianceComponent } from './cad/add-contract/statutory-compliance/statutory-compliance.component';
import { WorkOrderAdvanceComponent } from './cad/add-contract/work-order-advance/work-order-advance.component';
import { WorkOrderClauseComponent } from './cad/add-contract/work-order-clause/work-order-clause.component';
import { CadAdminHomeComponent } from './cad/cad-admin-home/cad-admin-home.component';
import { CadAdminInvoiceActionComponent } from './cad/cad-admin-invoice/cad-admin-invoice-action/cad-admin-invoice-action.component';
import { CadAdminInvoiceComponent } from './cad/cad-admin-invoice/cad-admin-invoice.component';
import { PoItemsComponent } from './cad/cad-admin-invoice/po-items/po-items.component';
import { CadVendorHoldListComponent } from './cad/cad-vendor-hold-list/cad-vendor-hold-list.component';
import { CadVendorHomeComponent } from './cad/cad-vendor-home/cad-vendor-home.component';
import { AdvanceAndRetentionComponent } from './cad/cjpc-action/advance-and-retention/advance-and-retention.component';
import { BillDetailsComponent } from './cad/cjpc-action/bill-details/bill-details.component';
import { CjpcActionComponent } from './cad/cjpc-action/cjpc-action.component';
import { ClauseAndComplianceDocumentComponent } from './cad/cjpc-action/clause-and-compliance-document/clause-and-compliance-document.component';
import { DeductionOfTaxesComponent } from './cad/cjpc-action/deduction-of-taxes/deduction-of-taxes.component';
import { PaymentsAdmittedComponent } from './cad/cjpc-action/payments-admitted/payments-admitted.component';
import { CjpcDetailsComponent } from './cad/cjpc-details/cjpc-details.component';
import { CjpcHoldsComponent } from './cad/cjpc-holds/cjpc-holds.component';
import { CjpcListComponent } from './cad/cjpc-list/cjpc-list.component';
import { CjpcRecoveriesComponent } from './cad/cjpc-recoveries/cjpc-recoveries.component';
import { ContractInvoiceComponent } from './cad/contract-invoice/contract-invoice.component';
import { ContractComponent } from './cad/contract/contract.component';
import { AdvanceTypeComponent } from './cad/project-configure/advance-type/advance-type.component';
import { ClouseTypeComponent } from './cad/project-configure/clouse-type/clouse-type.component';
import { ComplianceCategoryComponent } from './cad/project-configure/compliance-category/compliance-category.component';
import { ComplianceTypeComponent } from './cad/project-configure/compliance-type/compliance-type.component';
import { CurrencyComponent } from './cad/project-configure/currency/currency.component';
import { DepartmentComponent } from './cad/project-configure/department/department.component';
import { DocumentTypeComponent } from './cad/project-configure/document-type/document-type.component';
import { HoldTypeComponent } from './cad/project-configure/hold-type/hold-type.component';
import { InvoiceTypeComponent } from './cad/project-configure/invoice-type/invoice-type.component';
import { ProjectConfigureComponent } from './cad/project-configure/project-configure.component';
import { RecoveryTypeComponent } from './cad/project-configure/recovery-type/recovery-type.component';
import { RetentionComponent } from './cad/project-configure/retention/retention.component';
import { TaxDeductionTypeComponent } from './cad/project-configure/tax-deduction-type/tax-deduction-type.component';
import { RetentionReleaseComponent } from './cad/retention-release/retention-release.component';
import { ViewContractDetailsComponent } from './cad/view-contract-details/view-contract-details.component';
import { AdTableNgComponent } from './common/ad-table-ng/ad-table-ng.component';
import { AdTableComponent } from './common/ad-table/ad-table.component';
import { BreadcrumbComponent } from './common/breadcrumb/breadcrumb.component';
import { CenterModalComponent } from './common/center-modal/center-modal.component';
import { CustomModalComponent } from './common/custom-modal/custom-modal.component';
import { IndianCurrencyDirective } from './common/directives/indian-currency.directive';
import { OnlyDecimalDirective } from './common/directives/only-decimal.directive';
import { OnlyNumbersDirective } from './common/directives/only-numbers.directive';
import { UppercaseDirective } from './common/directives/uppercase.directive';
import { FileUploadComponent } from './common/file-upload/file-upload.component';
import { FooterComponent } from './common/footer/footer.component';
import { HeaderComponent } from './common/header/header.component';
import { LoginInputComponent } from './common/login-input/login-input.component';
import { LoginComponent } from './common/login/login.component';
import { IndianCurrencyPipe } from './common/pipes/indian-currency.pipe';
import { PopupAlertComponent } from './common/popup-alert/popup-alert.component';
import { PopupDialogComponent } from './common/popup-dialog/popup-dialog.component';
import { FormService } from './common/services/from.service';
import { SimpleTableComponent } from './common/simple-table/simple-table.component';
import { TitlePipe } from './common/title.pipe';
import { ToastMessageComponent } from './common/toast-message/toast-message.component';
import { TrackingTimelineComponent } from './common/tracking-timeline/tracking-timeline.component';
import { ExamplePdfViewerComponent } from './example-pdf-viewer/example-pdf-viewer.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AllVendorComponent } from './pages/all-vendor/all-vendor.component';
import { ConditionalInchargeComponent } from './pages/conditional-incharge/conditional-incharge.component';
import { ConditionalVendorComponent } from './pages/conditional-vendor/conditional-vendor.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EmployeeManagementComponent } from './pages/employee-management/employee-management.component';
import { HelpPageComponent } from './pages/help-page/help-page.component';
import { HomeComponent } from './pages/home/home.component';
import { LogisticComponent } from './pages/logistic/logistic.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PurchaseOrderComponent } from './pages/purchase-order/purchase-order.component';
import { RewardInchargeComponent } from './pages/reward-incharge/reward-incharge.component';
import { RewardInvoiceComponent } from './pages/reward-invoice/reward-invoice.component';
import { SamlCallbackComponent } from './pages/saml-callback/saml-callback.component';
import { ServiceSitecontrollerComponent } from './pages/service-sitecontroller/service-sitecontroller.component';
import { ServiceVendorComponent } from './pages/service-vendor/service-vendor.component';
import { SiteControllerComponent } from './pages/site-controller/site-controller.component';
import { SlaInchargeComponent } from './pages/sla-incharge/sla-incharge.component';
import { SlaInvoiceComponent } from './pages/sla-invoice/sla-invoice.component';
import { AdminHomeComponent } from './Paperless-Work/admin-home/admin-home.component';
import { InvoiceActionComponent } from './Paperless-Work/invoice-action/invoice-action.component';
import { VendorHomeComponent } from './Paperless-Work/vendor-home/vendor-home.component';
import { VendorUploadInvoiceComponent } from './Paperless-Work/vendor-upload-invoice/vendor-upload-invoice.component';
@NgModule({
  declarations: [
    AllMasterDataComponent,
    HeaderComponent,
    // AllBreadcrumbComponent,
    AllTrackingTimelineComponent,
    DeleteModalComponent,
    FooterComponent,
    CustomModalComponent,
    BreadcrumbComponent,
    MasterAdminDashboardComponent,
    FrieghtmasterComponent,
    TrackingTimelineComponent,
    NavbarComponent,
    MasterAdTableComponent,
    AddFrieghtBillComponent,
    AppComponent,
    MasterToastMsgComponent,
    AddBillComponent,
    AddFiDataComponent,
    LoginComponent,
    HeaderComponent,
    FooterComponent,
    ProfileComponent,
    PurchaseOrderComponent,
    DashboardComponent,
    ToastMessageComponent,
    HomeComponent,
    AdTableComponent,
    BreadcrumbComponent,
    SiteControllerComponent,
    AdminComponent,
    AdminDashboardComponent,
    EmployeeManagementComponent,
    LogisticComponent,
    ExamplePdfViewerComponent,
    ConditionalVendorComponent,
    HelpPageComponent,
    SamlCallbackComponent,
    SlaInvoiceComponent,
    SlaInchargeComponent,
    ServiceVendorComponent,
    ServiceSitecontrollerComponent,
    RewardInvoiceComponent,
    RewardInchargeComponent,
    TitlePipe,
    ConditionalInchargeComponent,
    CadAdminHomeComponent,
    CjpcDetailsComponent,
    SimpleTableComponent,
    ContractComponent,
    AddContractComponent,
    ProjectConfigureComponent,
    CustomModalComponent,
    DepartmentComponent,
    CurrencyComponent,
    DocumentTypeComponent,
    AdvanceTypeComponent,
    InvoiceTypeComponent,
    ClouseTypeComponent,
    ComplianceCategoryComponent,
    ComplianceTypeComponent,
    HoldTypeComponent,
    RecoveryTypeComponent,
    TaxDeductionTypeComponent,
    PopupDialogComponent,
    ContractInformationComponent,
    WorkOrderAdvanceComponent,
    WorkOrderClauseComponent,
    StatutoryComplianceComponent,
    OnlyNumbersDirective,
    AddApprovalComponent,
    CJPCApproversComponent,
    DepartmentApproversComponent,
    FinalBillApproversComponent,
    AdTableNgComponent,
    FileUploadComponent,
    CjpcListComponent,
    CjpcActionComponent,
    CjpcRecoveriesComponent,
    CjpcHoldsComponent,
    ContractInvoiceComponent,
    CadVendorHomeComponent,
    CadVendorHoldListComponent,
    TrackingTimelineComponent,
    UppercaseDirective,
    CadAdminInvoiceComponent,
    CadAdminInvoiceActionComponent,
    PoItemsComponent,
    ClauseAndComplianceDocumentComponent,
    BillDetailsComponent,
    AdvanceAndRetentionComponent,
    PaymentsAdmittedComponent,
    DeductionOfTaxesComponent,
    PopupAlertComponent,
    OnlyDecimalDirective,
    ViewContractDetailsComponent,
    IndianCurrencyDirective,
    IndianCurrencyPipe,
    CenterModalComponent,
    AllVendorComponent,
    RetentionComponent,
    RetentionReleaseComponent,
    LoginInputComponent,
    VendorHomeComponent,
    VendorUploadInvoiceComponent,
    AdminHomeComponent,
    InvoiceActionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
    AngularMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    FileUploadModule,
    NgxExtendedPdfViewerModule,
    NgSelectModule,
    ObserversModule
],
  providers: [FormService],
  exports: [OnlyNumbersDirective, PopupDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
