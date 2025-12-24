import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
import { Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  username: any;
  updatePurchase = false;
  private originalData: any[] = [];
  viewPurchase = false;
  public isCorrectionRequired: boolean = false;
  public correctionRequiredData: any = null;
  viewVendorInvoice:boolean = false;
  editPurchaseData: any = {};
  action = '';
  secretKey = CryptoJS.enc.Utf8.parse('vspeed_adani_web'); // 16-byte key
  IV = CryptoJS.enc.Utf8.parse('7865439098965555'); // 16-byte IV
  ALLapiUrl = 'http://10.212.87.140:8080/adani-logistics-service'

  constructor(private http: HttpClient, private router: Router, public spinner: NgxSpinnerService) {
    this.username = localStorage.getItem('username');
  }

  samlauth(data: any, url: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    url = `${environment.baseUrl}` + url
    return this.http.post(url, data);
  }

  login(data: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    let url = `${environment.baseUrl}/login`
    return this.http.post(url, data);
  }

    private createHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return headers;
  }


  loginSite(json: any) {
    return this.http.post(`${environment.baseUrl}/login`, json);
  }

  sendOTP(json: any) {
    // return this.http.post(`${environment.apiUrl}/auth/api/SupplierLogin`,json);
    // return this.http.post(`http://10.212.87.140:8080/packingbags/auth/api/SupplierLogin`,json);
    // return this.http.post(`http://10.212.87.140:8080/vendorportal/auth/api/VendorLogin`,json);
    // return this.http.post(`http://servicevendorinvoicehub.adani.com/vendorportal/auth/api/VendorLogin`,json);
    return this.http.post(`${environment.authUrl}/auth/api/VendorLogin`, json);
  }

  loginVendor(json: any) {
    // return this.http.get(`${environment.apiUrl}/auth/api/VarifyOtp?otp=${json.otp}&userId=${json.username}`);
    // return this.http.get(`http://10.212.87.140:8080/packingbags/auth/api/VarifyOtp?otp=${json.otp}&userId=${json.username}`);
    // return this.http.get(`http://10.212.87.140:8080/vendorportal/auth/api/VerifyOtp?otp=${json.otp}&userId=${json.username}`);
    // return this.http.get(`http://servicevendorinvoicehub.adani.com/vendorportal/auth/api/VerifyOtp?otp=${json.otp}&userId=${json.username}`);
    return this.http.get(`${environment.authUrl}/auth/api/VerifyOtp?otp=${json.otp}&userId=${json.username}&vendorNo=${json.vendorNo}`);
  }

  getVendors(json:any){
    return this.http.post(`${environment.authUrl}/auth/api/getVendors`, json)
  }

  /* Admin */
  /* getVendorDetails(json: any) {
    return this.http.get(`${environment.apiUrl}/api/invoice/getVendorDetails?vendorNo=${json}`, { headers: this.returnHeader() });
  } */

  /* setVendorDetails(json: any) {
    return this.http.post(`${environment.apiUrl}/api/invoice/setVendorDetails`, json, { headers: this.returnHeader() });
  } */

  /* getVendorsList() {
    return this.http.get(`${environment.apiUrl}/api/invoice/getVendorList`, { headers: this.returnHeader() })
  } */

  /* Employees */
  /* getEmployeesList() {
    return this.http.get(`${environment.apiUrl}/api/invoice/getEmployeeList`, { headers: this.returnHeader() })
  } */

  /* Logistic */
  getLogisticData() {
    return this.http.get(`${environment.apiUrl}/api/logistic/getLogisticData`, { headers: this.returnHeader() });
  }

  setOriginalData(data: any[]) {
    this.originalData = data;
  }

  getOriginalData(): any[] {
    return this.originalData;
  }

  getPDFFile(filedata: any) {
    return this.http.post(`${environment.apiUrl}/api/blob/getFile`, filedata, { headers: this.returnHeader() })
  }

  updateVsandEpStatus(data: any) {
    return this.http.post(`${environment.apiUrl}/api/logistic/updateVsandEpStatus`, data, { headers: this.returnHeader() })
  }

  getAttachmentFromBlob(blobId?:any){
    return this.http.get(`${environment.apiUrl}/api/blob/getFile/${blobId}`, { headers: this.returnHeader()})
  }

      getPoItemsRates(data:any){
    return this.http.post(`http://10.212.87.140:8080/adani-logistics-service/consume/vspeed/getPoItemRates`, data, { headers: this.returnHeader() })
  }

  getDataForAll(url: any) {
    url = `${environment.apiUrllogistics}/${url}`;
    return this.http.get(url, { headers: this.returnHeader() })
  }
  fiBulkUpload(file: File, user: string): Observable<any> {
    const url = `${environment.apiUrllogistics}/api/fileUpload/fiBulkUpload?user=${encodeURIComponent(user)}`;
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(url, formData, { headers: this.returnHeader() });
  }

    postDataForALL(url: any, json: any) {
    const header = this.createHeaders();
    url = `${environment.apiUrllogistics}/${url}`;
    return this.http.post(url, json, { headers: header })
  }
  dataPostMaster(url: any, json: any) {
    const header = this.createHeaders();
    url = `${environment.apiUrllogistics}/${url}`;
    return this.http.post(url, json, { headers: header })
  }
   // --- FI Mapping API Methods ---

  /**
   * Create FI Mapping
   * @param data FI Mapping object
   */
  createFiMapping(data: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/fi-mapping/create`;
    return this.http.post(url, data, { headers: this.returnHeader() });
  }

  /**
   * Delete FI Mapping by ID
   * @param id FI Mapping ID
   */
  deleteFiMapping(id: string | number): Observable<any> {
    const url = `${environment.apiUrllogistics}/fi-mapping/delete/${id}`;
    return this.http.delete(url, { headers: this.returnHeader() });
  }

  /**
   * Get FI Mapping by ID
   * @param id FI Mapping ID
   */
  getFiMappingById(id: string | number): Observable<any> {
    const url = `${environment.apiUrllogistics}/fi-mapping/getById/${id}`;
    return this.http.get(url, { headers: this.returnHeader() });
  }

  /**
   * Search FI Mappings (paginated)
   * @param page Page number
   * @param size Page size
   * @param body Search/filter object
   */
  searchFiMappings(page: number, size: number, body: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/fi-mapping/search/${page}/${size}`;
    return this.http.post(url, body, { headers: this.returnHeader() });
  }

  /**
   * Update FI Mapping
   * @param data FI Mapping object (must include id)
   */
  updateFiMapping(data: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/fi-mapping/update`;
    return this.http.post(url, data, { headers: this.returnHeader() });
  }

  // --------------Bill to mapping

getBillToMappingList(): Observable<any> {
    const url = `${environment.apiUrllogistics}/allBillToMapping/GetDataForBill`;
    return this.http.get(url, { headers: this.returnHeader() });
  }

    dataGetMaster(url: any) {
    url = `${environment.apiUrllogistics}/${url}`;
    return this.http.get(url, { headers: this.returnHeader() })
  }

  /**
   * Get Bill To Mapping by ID
   */
  getBillToMappingById(id: string | number): Observable<any> {
    const url = `${environment.apiUrllogistics}/allBillToMapping/get/${id}`;
    return this.http.get(url, { headers: this.returnHeader() });
  }

  /**
   * Insert Bill To Mapping
   */
  insertBillToMapping(data: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/allBillToMapping/InsertBillData`;
    return this.http.post(url, data, { headers: this.returnHeader() });
  }

  /**
   * Update Bill To Mapping
   */
  updateBillToMapping(data: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/allBillToMapping/UpdateBillData`;
    return this.http.post(url, data, { headers: this.returnHeader() });
  }

  /**
   * Delete Bill To Mapping by ID (with deletedBy as query param)
   */
  deleteBillToMapping(id: string | number, deletedBy: string = 'allBillToMapping'): Observable<any> {
    const url = `${environment.apiUrllogistics}/allBillToMapping/delete/${id}?deletedBy=${encodeURIComponent(deletedBy)}`;
    return this.http.delete(url, { headers: this.returnHeader() });
  }

  /**
   * Search Bill To Mapping (paginated)
   */
  searchBillToMapping(page: number, size: number, body: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/allBillToMapping/search/${page}/${size}`;
    return this.http.post(url, body, { headers: this.returnHeader() });
  }


  // ------------------- Vendor APIs -------------------

  /**
   * Get Plant Data
   */
  getVendorPlantData(): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/GetPlantData`;
    return this.http.get(url, { headers: this.returnHeader() });
  }

  /**
   * Get Vendor Details
   */
  getVendorDetails(): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/getVendorDetails`;
    return this.http.get(url, { headers: this.returnHeader() });
  }

    getVendorDetailsById(id: string | number): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/get/${id}`;
    return this.http.get(url, { headers: this.returnHeader() });
  }

  /**
   * Get Vendor List
   */
  getVendorList(): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/getVendorList`;
    return this.http.get(url, { headers: this.returnHeader() });
  }

  /**
   * Get Vendor Master Data
   */
  getVendorMasterData(): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/GetVendorMasterData`;
    return this.http.get(url, { headers: this.returnHeader() });
  }

  /**
   * Search Vendor Master (paginated)
   */
  searchVendorMaster(page: number, size: number, body: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/search/${page}/${size}`;
    return this.http.post(url, body, { headers: this.returnHeader() });
  }

  /**
   * Set Vendor Details
   */
  setVendorDetails(data: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/setVendorDetails`;
    return this.http.post(url, data, { headers: this.returnHeader() });
  }

  /**
   * Update Vendor Master
   */
  updateVendorMaster(data: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/UpdateVendorMaster`;
    return this.http.post(url, data, { headers: this.returnHeader() });
  }

  /**
   * Delete Vendor by ID
   */
deleteVendor(id: string | number, deletedBy: string = 'vendor'): Observable<any> {
  const url = `${environment.apiUrllogistics}/vendor/delete/${id}?deletedBy=${encodeURIComponent(deletedBy)}`;
  return this.http.delete(url, { headers: this.returnHeader() });
}




  /* Purchase Invoice Order */
  /* purchaseOrder(json: any) {
    let headers = new HttpHeaders();
    // headers.append('user', this.username);
    // return this.http.post(`${environment.apiUrl}/api/invoice/PostPOInvoice`, json, {headers: headers});
    return this.http.post(`${environment.apiUrl}/api/invoice/PostPOInvoice`, json, { headers: this.returnHeader() });
  } */

  /* getPurchaseOrderList(param: any) {
    return this.http.get(`${environment.apiUrl}/api/invoice/POInvoiceDetails?createdBy=${param}`, { headers: this.returnHeader() });
  } */

  /* deletePurchaseOrder(json: any) {
    return this.http.post(``, json, { headers: this.returnHeader() });
  } */

  /* getPODetail(param: any, invoiceType?: any) {
    // return this.http.get(`${environment.apiUrl}/api/invoice/GetPODetails1/${param}`);
    // return this.http.get(`${environment.apiUrl}/api/invoice/GetPODetails?poNumber=${param}`, {headers: this.returnHeader()});
    // return this.http.get(`${environment.apiUrl}/api/invoice/GetPODetails?poNumber=${param}&invoiceType=${invoiceType}`, {headers: this.returnHeader()});
    return this.http.get(`${environment.apiUrl}/api/invoice/getPODetails?poNumber=${param}&invoiceType=${invoiceType}`, { headers: this.returnHeader() });
  } */

  /* validateInvoiceNumber(json: any) {
    return this.http.get(`${environment.apiUrl}/api/invoice/InvoiceVendorValidation?createdBy=${json.vendorNumber}&invoiceNumber=${json.invoiceNumber}`, { headers: this.returnHeader() })
  } */

  /* getSubmissionTo(param?:any, invoice_type?: any, preqNo?:any) {
    // return this.http.get(`${environment.apiUrl}/api/invoice/plantDetails?plantCode=${param}`, {headers: this.returnHeader()});
    return this.http.get(`${environment.apiUrl}/api/invoice/plantDetails?plantCode=${param}&invoiceType=${invoice_type}&preqNo=${preqNo}`, {headers: this.returnHeader()});
  } */

  /* viewAttachment(filePath: any) {
    return this.http.get(`${environment.apiUrl}/api/invoice/getBase64FromPath?filePath=${filePath}`, { headers: this.returnHeader() });
  } */

  dataGetMasterRCM(url: any) {
    url = `${environment.apiUrl}/api/Master/${url}`;
    return this.http.get(url, { headers: this.returnHeader() })
  }

  dataGet(url: any) {
    url = `${environment.apiUrl}/api/invoice/${url}`;
    return this.http.get(url, { headers: this.returnHeader() })
  }

  dataAdminGet(url: any) {
    url = `${environment.apiUrllogistics}/test/${url}`;
    return this.http.get(url, { headers: this.returnHeader() })
  }

  dataPost(url: any, json: any) {
    url = `${environment.apiUrl}/api/invoice/${url}`;
    return this.http.post(url, json, { headers: this.returnHeader() })
  }

  dataGetAttach(url?:any){
    url = `${environment.apiUrl}/api/fileUpload/${url}`
    return this.http.get(url, { responseType: 'blob', headers: this.returnHeader() });
  }

  dataPostAttach(url: any, json: any) {
    url = `${environment.apiUrl}/api/fileUpload/${url}`;
    return this.http.post(url, json, { headers: this.returnHeader() })
  }

  dataGetAttachByBlob(url?:any){
    url = `${environment.apiUrl}/api/blob/${url}`;
    return this.http.get(url, { responseType: 'blob', headers: this.returnHeader() })
  }

  dataUploadBlob(url: any, json: any){
    url = `${environment.apiUrl}/api/blob/${url}`;
    return this.http.post(url, json, { headers: this.returnHeader() })
  }

  dataLogout(url: any, json: any) {
    url = `${environment.apiUrl}/api/${url}`;
    return this.http.post(url, json, { headers: this.returnHeader() })
  }

  /* Headers Start */
  returnHeader() {
    let headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    })
    return headers;
  }
  /* Headers End */

  /* Site Controller */
  /* getSiteControllerOrderList(param: any) {
    return this.http.get(`${environment.apiUrl}/api/invoice/POInvoiceDetailsSubmitTo?submissionTo=${param}`, { headers: this.returnHeader() });
  } */

  /* getGRNSES(param: any) {
    return this.http.get(`${environment.apiUrl}/api/invoice/getPOSesAndGrnDetails?poInvoiceID=${param}`, { headers: this.returnHeader() });
  } */

  /* updateSiteController(json: any) {
    return this.http.post(`${environment.apiUrl}/api/invoice/postPOSesAndGrnDetails`, json, { headers: this.returnHeader() });
  } */

  // Routing
  /* routeToLogin() {
    this.router.navigate(['']);
  } */

  /* routeToAdmin() {
    this.router.navigate(['./admin']);
  } */

  /* routeToDashboard() {
    this.router.navigate(['./dashboard']);
  } */

  /* routeToProfile() {
    this.router.navigate(['./dashboard/profile']);
  } */

  /* routeToPurchaseOrder() {
    // this.router.navigate(['./dashboard/purchase']);
    this.router.navigate(['./dashboard/material-invoice']);
  } */

  /* routeToconditionalFormInvoice() {
    this.router.navigate(['./dashboard/freight-inbound/invoice']);
  } */

  /* routeToSiteController() {
    // this.router.navigate(['./dashboard/sitecontroller']);
    this.router.navigate(['./dashboard/storesincharge']);
  } */

  routeToLogisticDashboard() {
    this.router.navigate(['./dashboard/logistic']);
  }

  routeToPage(page: any) {
    // Remove leading './' or '/' for Angular navigation
    if (typeof page === 'string') {
      page = page.replace(/^\.?\//, '');
    }
    this.router.navigate([page]);
  }

  // Attachment
  /* getMergedAttachment(json: any) {
    return this.http.post(`${environment.apiUrl}/api/invoice/mergePDF`, json, { headers: this.returnHeader() })
  } */

  /* uploadSignedAttachment(json: any) {
    return this.http.post(`${environment.apiUrl}/api/invoice/checkDigitalSignature`, json, { headers: this.returnHeader() })
  } */

  /* Excel Sheet */
  getExcelFile(url: any) {
    return this.http.get(url, { responseType: 'blob' })
  }

  uploadFile(url: any, file: File): Observable<any> {
    url = `${environment.apiUrl}` + url;
    const token = localStorage.getItem('token');

    // Set the token in the headers
    const header = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // console.log('file', file);

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(url, formData, { headers: header });
  }

  /* Tracking */
  /* getSapTrackingStatus(poInvoiceId: any) {
    return this.http.get(`${environment.apiUrl}/api/invoice/getSapTrackingStatus?poInvoiceId=${poInvoiceId}`, { headers: this.returnHeader() })
  } */


  getEncryptPath(path?:any){
    const encryptedMessage = CryptoJS.AES.encrypt(path, this.secretKey, {
        iv: this.IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    )

    let base64 =  encryptedMessage.toString();
    const urlSafeBase64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return urlSafeBase64;
  }

  logout() {
    const url = `${environment.apiUrl}/api/logoutSession`;
    const token = localStorage.getItem('token');
    const sessionId = localStorage.getItem('sessionId');
    const userName = localStorage.getItem('username') || '';



    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const payload = {
      token: `Bearer ${token}`,
      sessionId: sessionId
    };

    return this.http.post<{ status: string, message: string }>(url, [payload], { headers });
  }
}
