import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { NgxSpinnerService } from "ngx-spinner";
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AllMaterService {
  username: any;
  updatePurchase = false;
  private originalData: any[] = [];
  viewPurchase = false;
  viewVendorInvoice: boolean = false;
  editPurchaseData: any = {};
  action = '';
  secretKey = CryptoJS.enc.Utf8.parse('vspeed_adani_web');
  IV = CryptoJS.enc.Utf8.parse('7865439098965555');
  ALLapiUrl = 'api/invoice/getAllRate'
  constructor(private http: HttpClient, private router: Router, public spinner: NgxSpinnerService) {
    this.username = localStorage.getItem('username');
  }
  private createHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return headers;
  }
  returnHeader() {
    let headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    })
    return headers;
  }
  getPoItemsRates(json: any) {
    const url = `${environment.apiUrl}/${this.ALLapiUrl}`;
    return this.http.post(url, json)
  }
  getDataForAll(url: any) {
    url = `${environment.apiUrllogistics}/${url}`;
    return this.http.get(url)
  }
  fiBulkUpload(file: File, user: string): Observable<any> {
    const url = `${environment.apiUrllogistics}/api/fileUpload/fiBulkUpload?user=${encodeURIComponent(user)}`;
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(url, formData);
  }
  postDataForALL(url: any, json: any) {
    const header = this.createHeaders();
    url = `${environment.apiUrllogistics}/${url}`;
    return this.http.post(url, json)
  }
  dataPostMaster(url: any, json: any) {
    const header = this.createHeaders();
    url = `${environment.apiUrllogistics}/${url}`;
    return this.http.post(url, json)
  }
  /**
   * Create FI Mapping
   * @param data FI Mapping object
   */
  createFiMapping(data: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/fi-mapping/create`;
    return this.http.post(url, data);
  }
  /**
   * Delete FI Mapping by ID
   * @param id FI Mapping ID
   */
  deleteFiMapping(id: string | number): Observable<any> {
    const url = `${environment.apiUrllogistics}/fi-mapping/delete/${id}`;
    return this.http.delete(url);
  }
  /**
   * Get FI Mapping by ID
   * @param id FI Mapping ID
   */
  getFiMappingById(id: string | number): Observable<any> {
    const url = `${environment.apiUrllogistics}/fi-mapping/getById/${id}`;
    return this.http.get(url);
  }
  /**
   * Search FI Mappings (paginated)
   * @param page Page number
   * @param size Page size
   * @param body Search/filter object
   */
  searchFiMappings(page: number, size: number, body: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/fi-mapping/search/${page}/${size}`;
    return this.http.post(url, body);
  }
  /**
   * Update FI Mapping
   * @param data FI Mapping object (must include id)
   */
  updateFiMapping(data: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/fi-mapping/update`;
    return this.http.post(url, data);
  }
  getBillToMappingList(): Observable<any> {
    const url = `${environment.apiUrllogistics}/allBillToMapping/GetDataForBill`;
    return this.http.get(url);
  }
  dataGetMaster(url: any) {
    url = `${environment.apiUrllogistics}/${url}`;
    return this.http.get(url)
  }
  /**
   * Get Bill To Mapping by ID
   */
  getBillToMappingById(id: string | number): Observable<any> {
    const url = `${environment.apiUrllogistics}/allBillToMapping/get/${id}`;
    return this.http.get(url);
  }
  /**
   * Insert Bill To Mapping
   */
  insertBillToMapping(data: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/allBillToMapping/InsertBillData`;
    return this.http.post(url, data);
  }
  /**
   * Update Bill To Mapping
   */
  updateBillToMapping(data: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/allBillToMapping/UpdateBillData`;
    return this.http.post(url, data);
  }
  /**
   * Delete Bill To Mapping by ID (with deletedBy as query param)
   */
  deleteBillToMapping(id: string | number, deletedBy: string = 'allBillToMapping'): Observable<any> {
    const url = `${environment.apiUrllogistics}/allBillToMapping/delete/${id}?deletedBy=${encodeURIComponent(deletedBy)}`;
    return this.http.delete(url);
  }
  /**
   * Search Bill To Mapping (paginated)
   */
  searchBillToMapping(page: number, size: number, body: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/allBillToMapping/search/${page}/${size}`;
    return this.http.post(url, body);
  }
  /**
   * Get Plant Data
   */
  getVendorPlantData(): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/GetPlantData`;
    return this.http.get(url);
  }
  /**
   * Get Vendor Details
   */
  getVendorDetails(): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/getVendorDetails`;
    return this.http.get(url);
  }
  getVendorDetailsById(id: string | number): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/get/${id}`;
    return this.http.get(url);
  }
  /**
   * Get Vendor List
   */
  getVendorList(): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/getVendorList`;
    return this.http.get(url);
  }
  /**
   * Get Vendor Master Data
   */
  getVendorMasterData(): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/GetVendorMasterData`;
    return this.http.get(url);
  }
  /**
   * Search Vendor Master (paginated)
   */
  searchVendorMaster(page: number, size: number, body: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/search/${page}/${size}`;
    return this.http.post(url, body);
  }
  /**
   * Set Vendor Details
   */
  setVendorDetails(data: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/setVendorDetails`;
    return this.http.post(url, data);
  }
  /**
   * Update Vendor Master
   */
  updateVendorMaster(data: any): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/UpdateVendorMaster`;
    return this.http.post(url, data);
  }
  /**
   * Delete Vendor by ID
   */
  deleteVendor(id: string | number, deletedBy: string = 'vendor'): Observable<any> {
    const url = `${environment.apiUrllogistics}/vendor/delete/${id}?deletedBy=${encodeURIComponent(deletedBy)}`;
    return this.http.delete(url);
  }
}
