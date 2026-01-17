import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './common/login/login.component';
import { authGuard } from './services/auth.guard';
import { ProfileComponent } from './pages/profile/profile.component';
import { PurchaseOrderComponent } from './pages/purchase-order/purchase-order.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { SiteControllerComponent } from './pages/site-controller/site-controller.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { EmployeeManagementComponent } from './pages/employee-management/employee-management.component';
import { LogisticComponent } from './pages/logistic/logistic.component';
import { ServiceVendorComponent } from './pages/service-vendor/service-vendor.component';
import { ConditionalVendorComponent } from './pages/conditional-vendor/conditional-vendor.component';
import { HelpPageComponent } from './pages/help-page/help-page.component';
import { ArticlesComponent } from './pages/articles/articles.component';
import { SamlCallbackComponent } from './pages/saml-callback/saml-callback.component';
import { SlaInvoiceComponent } from './pages/sla-invoice/sla-invoice.component';
import { SlaInchargeComponent } from './pages/sla-incharge/sla-incharge.component';

import { ServiceSitecontrollerComponent } from './pages/service-sitecontroller/service-sitecontroller.component';
import { RewardInvoiceComponent } from './pages/reward-invoice/reward-invoice.component';
import { RewardInchargeComponent } from './pages/reward-incharge/reward-incharge.component';
import { ConditionalInchargeComponent } from './pages/conditional-incharge/conditional-incharge.component';
import { CadAdminHomeComponent } from './cad/cad-admin-home/cad-admin-home.component';
import { CjpcDetailsComponent } from './cad/cjpc-details/cjpc-details.component';
import { ContractComponent } from './cad/contract/contract.component';
import { AddContractComponent } from './cad/add-contract/add-contract.component';
import { ProjectConfigureComponent } from './cad/project-configure/project-configure.component';
import { AddApprovalComponent } from './cad/add-approval/add-approval.component';
import { CjpcListComponent } from './cad/cjpc-list/cjpc-list.component';
import { CjpcActionComponent } from './cad/cjpc-action/cjpc-action.component';
import { ContractInvoiceComponent } from './cad/contract-invoice/contract-invoice.component';
import { CadVendorHomeComponent } from './cad/cad-vendor-home/cad-vendor-home.component';
import { CadVendorHoldListComponent } from './cad/cad-vendor-hold-list/cad-vendor-hold-list.component';
import { CadAdminInvoiceComponent } from './cad/cad-admin-invoice/cad-admin-invoice.component';
import { CadAdminInvoiceActionComponent } from './cad/cad-admin-invoice/cad-admin-invoice-action/cad-admin-invoice-action.component';
import { ViewContractDetailsComponent } from './cad/view-contract-details/view-contract-details.component';
import { AllVendorComponent } from './pages/all-vendor/all-vendor.component';
import { VendorHomeComponent } from './Paperless-Work/vendor-home/vendor-home.component';
import { VendorUploadInvoiceComponent } from './Paperless-Work/vendor-upload-invoice/vendor-upload-invoice.component';
import { AdminHomeComponent } from './Paperless-Work/admin-home/admin-home.component';
import { InvoiceActionComponent } from './Paperless-Work/invoice-action/invoice-action.component';
import { MasterAdTableComponent } from './All-Master/master-ad-table/master-ad-table.component';
import { AddBillComponent } from './All-Master/add-bill/add-bill.component';
import { AddFiDataComponent } from './All-Master/add-fi-data';
import { MasterAdminDashboardComponent } from './All-Master/master-admin-dashboard/master-admin-dashboard.component';
import { AllMasterDataComponent } from './All-Master/all-master-data/all-master-data.component';
import { FrieghtmasterComponent } from './All-Master/frieghtmaster/frieghtmaster.component';
import { AddFrieghtBillComponent } from './All-Master/add-frieght-bill/add-frieght-bill.component';
import { SimulationComponent } from './pages/simulation/simulation.component';
import { HowThingsWorkComponent } from './pages/how-things-work/how-things-work.component';
import { CourseComponent } from './pages/course/course.component';
import { ConsultationComponent } from './pages/consultation/consultation.component';
import { ResetPasswordComponent } from './common/reset-password/reset-password.component';
import { ProcessComponent } from './pages/process/process.component';
import { ToolsComponent } from './pages/tools/tools.component';
import { AllArticlesComponent } from './pages/all-articles/all-articles.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'sso', component: SamlCallbackComponent },
  { path: 'login/sso', component: SamlCallbackComponent },
  // {path: 'admin', component:AdminComponent, canActivate:[authGuard]},
  {
    path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard], children: [
      { path: '', component: AdminComponent },
      { path: 'vendor', component: AdminComponent },
      { path: 'employee', component: EmployeeManagementComponent }
    ]
  },
  {
    //, canActivate: [authGuard]
    path: 'dashboard', component: DashboardComponent, children: [
      { path: '', component: HomeComponent },
      { path: 'all', component: AllVendorComponent, canActivate: [authGuard] },
      { path: 'logistic', component: LogisticComponent },
      { path: 'home', component: HomeComponent },
      { path: 'help', component: HelpPageComponent },
      { path: 'all-articles/my-articles', component: ArticlesComponent },
      { path: 'all-articles', component: AllArticlesComponent },
      { path: 'simulation', component: SimulationComponent },
      { path: 'how-things-work', component: HowThingsWorkComponent },
      { path: 'course', component: CourseComponent },
      { path: 'consultation', component: ConsultationComponent },
      { path: 'process', component: ProcessComponent },
      { path: 'tools', component: ToolsComponent },
      { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
      { path: 'purchase', component: PurchaseOrderComponent, canActivate: [authGuard] },
      { path: 'conditional-vendor', component: ConditionalVendorComponent, canActivate: [authGuard] },
      { path: 'sitecontroller', component: SiteControllerComponent, canActivate: [authGuard] },
      { path: 'storesincharge', component: SiteControllerComponent, canActivate: [authGuard] },

      { path: 'material-invoice', component: PurchaseOrderComponent, canActivate: [authGuard] },
      // {path: 'freight-inbound', component:PurchaseOrderComponent, canActivate:[authGuard]},
      { path: 'freight-inbound/invoice', component: ConditionalVendorComponent, canActivate: [authGuard] },
      { path: 'freight-inbound-invoice', component: ConditionalVendorComponent, canActivate: [authGuard] },
      { path: 'conditional-invoice', component: ConditionalVendorComponent, canActivate: [authGuard] },
      { path: 'service-invoice', component: ServiceVendorComponent, canActivate: [authGuard] },
      { path: 'sla-invoice', component: SlaInvoiceComponent, canActivate: [authGuard] },
      { path: 'reward-invoice', component: RewardInvoiceComponent, canActivate: [authGuard] },

      { path: 'material-incharge', component: SiteControllerComponent, canActivate: [authGuard] },
      // {path: 'conditional-incharge', component:ConditionalInchargeComponent, canActivate:[authGuard]},
      { path: 'raw-material-incharge', component: ConditionalInchargeComponent, canActivate: [authGuard] },
      { path: 'service-incharge', component: ServiceSitecontrollerComponent, canActivate: [authGuard] },
      { path: 'sla-incharge', component: SlaInchargeComponent, canActivate: [authGuard] },
      { path: 'reward-incharge', component: RewardInchargeComponent, canActivate: [authGuard] },
    ]
  },
  {
    path: 'CAD', component: DashboardComponent, canActivate: [authGuard], children: [
      { path: '', component: CadAdminHomeComponent },
      { path: 'home', component: CadAdminHomeComponent },
      { path: 'invoice', component: CadAdminInvoiceComponent },
      { path: 'vendor', component: CadVendorHomeComponent },
      { path: 'vendor/home', component: CadVendorHomeComponent },
      { path: 'vendor/home/invoice', component: ContractInvoiceComponent },
      { path: 'cjpc', component: CjpcDetailsComponent },
      { path: 'cjpc-list', component: CjpcListComponent },
      { path: 'vendor/home/hold-list', component: CadVendorHoldListComponent },
      { path: 'cjpc-action', component: CjpcActionComponent },
      { path: 'contract', component: ContractComponent },
      { path: 'contract/add-contract', component: AddContractComponent },
      { path: 'contract/approvers', component: AddApprovalComponent },
      { path: 'contract/contract-details', component: ViewContractDetailsComponent },
      { path: 'master', component: ProjectConfigureComponent },
      { path: 'master/project-configuration', component: ProjectConfigureComponent },
      { path: 'invoice/purchase-order', component: CadAdminInvoiceActionComponent },

    ]
  }, {

    path: 'All-Master', component: MasterAdminDashboardComponent, canActivate: [authGuard], children: [
      { path: '', component: AllMasterDataComponent },
      { path: 'all-master-data', component: AllMasterDataComponent },
      { path: 'add-bill', component: AddBillComponent },
      { path: 'add-bill/:id', component: AddBillComponent },
      { path: 'add-fi-data', component: AddFiDataComponent },
      { path: 'add-fi-data/:id', component: AddFiDataComponent },
      { path: 'frieght', component: FrieghtmasterComponent },
      { path: 'add-frieght-bill', component: AddFrieghtBillComponent },
      { path: 'add-frieght-bill/:id', component: AddFrieghtBillComponent },
      { path: '**', component: AllMasterDataComponent },
    ]

  },

  {
    path: 'paperless-work', component: DashboardComponent, canActivate: [authGuard], children: [
      { path: '', component: AdminHomeComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'home', component: AdminHomeComponent },
      { path: 'home/invoice', component: InvoiceActionComponent },
      { path: 'vendor-home', component: VendorHomeComponent },
      { path: 'vendor-home', component: VendorHomeComponent },
      { path: 'vendor-home/invoice', component: VendorUploadInvoiceComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  // imports: [RouterModule.forRoot(routes, { useHash: true })],
  imports: [RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
