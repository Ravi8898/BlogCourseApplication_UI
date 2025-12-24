import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl: any = environment.cadUrl;
  username: string | null;
  userdata: any
  roleName: string | null;

  constructor(
    private http: HttpClient

  ) {
    this.username = localStorage.getItem('username');
    this.userdata = JSON.parse(localStorage.getItem('userdata') || '{}');
    this.roleName = localStorage.getItem('roleName') || '';
  }

  getUserName(): string {
    return localStorage.getItem('username') || ''
  }
  getRoleName(): string {
    return localStorage.getItem('roleName') || ''
  }

  dataGet(url: any) {
    url = this.baseUrl + url;
    return this.http.get(url, { headers: this.returnHeader() })
  }

  dataPost(url: any, json: any) {
    url = this.baseUrl + url;
    return this.http.post(url, json, { headers: this.returnHeader() })
  }


  download(url: any, json: any) {
    const header = new HttpHeaders({
      'PublicKey': `rIA_1vbatpDH0OV1QqxSppuBRuCTUgOtE8Q~M6.8`
    });

    return this.http.post(url, json, { headers: header })
  }

  uploadDocument(url: any, json: any, file: File) {
    url = this.baseUrl + url;

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('documentid', json.documentid);
    formData.append('contractid', json.contractid);
    formData.append('advanceid', json.advanceid);
    formData.append('documenttypeid', json.documenttypeid);
    formData.append('documentname', json.documentname);
    formData.append('documentversion', json.documentversion);
    formData.append('loginuser', json.loginuser);

    return this.http.post(url, formData, { headers: this.returnHeader() })
  }
  uploadClauseDocument(url: any, json: any, file: File) {
    url = this.baseUrl + url;

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('documentid', json.documentid);
    formData.append('contractid', json.contractid);
    formData.append('clauseid', json.clauseid);
    formData.append('documenttypeid', json.documenttypeid);
    formData.append('documentname', json.documentname);
    formData.append('documentversion', json.documentversion);
    formData.append('loginuser', json.loginuser);

    return this.http.post(url, formData, { headers: this.returnHeader() })
  }
  uploadComplainceDocument(url: any, json: any, file: File) {
    console.log('json', json);

    url = this.baseUrl + url;

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('documentid', json.documentid);
    formData.append('contractid', json.contractid);
    formData.append('complianceid', json.complianceid);
    formData.append('documenttypeid', json.documenttypeid);
    formData.append('documentname', json.documentname);
    formData.append('documentversion', json.documentversion);
    formData.append("contractinvoicerefno", json.contractinvoicerefno);
    formData.append('loginuser', json.loginuser);

    return this.http.post(url, formData, { headers: this.returnHeader() })
  }
  uploadInvoiceDocument(url: any, json: any, file: File) {
    // console.log('json', json);

    url = this.baseUrl + url;

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('invoicenumber', json.invoicenumber);
    formData.append('contractid', json.contractid);
    formData.append('fkdocumenttypeid', json.fkdocumenttypeid);
    formData.append('doctypename', json.doctypename);
    formData.append('invoicedocumenttypeid', json.invoicedocumenttypeid);
    formData.append('invoiceTypeName', json.invoiceTypeName);
    formData.append('documentid', json.documentid);
    formData.append('loginuser', json.loginuser);
    formData.append('contractinvoicerefno', json.contractinvoicerefno)

    return this.http.post(url, formData, { headers: this.returnHeader() })
  }
  uploadReleaseDocument(url: any, json: any, file: File) {
    console.log('json', json);

    url = this.baseUrl + url;

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('documentid', json.documentid);
    formData.append('contractid', json.contractid);
    formData.append('invoiceid', json.invoiceid);
    formData.append('invoiceTypeName', json.invoiceTypeName);
    formData.append('loginuser', json.loginuser);

    return this.http.post(url, formData, { headers: this.returnHeader() })
  }
  uploadRecoveryDocument(url: any, json: any, file: File) {
    url = this.baseUrl + url;

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('contractId', json.contractId);
    formData.append('fkdocumenttypeid', json.fkdocumenttypeid);
    formData.append('documentName', json.documentName);
    formData.append('invoiceid', json.invoiceid);
    formData.append('invoiceTypeName', json.invoiceTypeName);
    formData.append('docUploadId', json.docUploadId);
    formData.append('loginuser', json.loginuser);

    return this.http.post(url, formData, { headers: this.returnHeader() })
  }

  postFormData(url: string, formData: FormData) {
    url = this.baseUrl + url;
    return this.http.post(url, formData);
  }

  returnHeader() {
    let headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "frame-ancestors 'none';",
      'X-Content-Type-Options': 'nosniff'
    })
    return headers;
  }

  handleError(error: any): string {
    if (error.status == 0) {
      console.log('Server is down Or Something went wrong');
      return 'Alert: Server is down Or Something went wrong';
    } else if (error.status == 400) {
      console.log('Bad request', error);
      if (error?.error?.validationErrors) {
        let ex = JSON.stringify(error?.error?.validationErrors)
        return ex
      } else if (error?.error?.message) {
        return error.error.message;
      }
      else {
        return 'Alert: Bad request';
      }
      // return error?.error?.message;
    } else if (error.status == 401) {
      console.log('Unauthorized');
      return 'Alert: Unauthorized';
    } else if (error.status == 402) {
      console.log('Payment required');
      return 'Alert: Payment required';
    } else if (error.status == 403) {
      console.log('Forbidden');
      return 'Alert: Forbidden';
    } else if (error.status == 404) {
      console.log('Not found');
      return 'Alert: Not found';
    } else if (error.status == 405) {
      console.log('Method not allowed');
      return 'Alert: Method not allowed';
    } else if (error.status == 406) {
      console.log('Not acceptable');
      return 'Alert: Not acceptable';
    } else if (error.status == 407) {
      console.log('Proxy authentication required');
      return 'Alert: Proxy authentication required';
    } else if (error.status == 408) {
      console.log('Request timeout');
      return 'Alert: Request timeout';
    } else if (error.status == 409) {
      console.log('Conflict');
      return 'Alert: ' + error.error.message;
    } else if (error.status == 410) {
      console.log('Gone');
      return 'Alert: Gone';
    } else if (error.status == 411) {
      console.log('Length required');
      return 'Alert: Length required';
    } else if (error.status == 412) {
      console.log('Precondition failed');
      return 'Alert: Precondition failed';
    } else if (error.status == 413) {
      console.log('Payload too large');
      return 'Alert: Payload too large';
    } else if (error.status == 414) {
      console.log('URI too long');
      return 'Alert: URI too long';
    } else if (error.status == 415) {
      console.log('Unsupported media type');
      return 'Alert: Unsupported media type';
    } else if (error.status == 416) {
      console.log('Range not satisfiable');
      return 'Alert: Range not satisfiable';
    } else if (error.status == 417) {
      console.log('Expectation failed');
      return 'Alert: Expectation failed';
    } else if (error.status == 418) {
      console.log('I am a teapot');
      return 'Alert: I am a teapot';
    } else if (error.status == 422) {
      console.log('Unprocessable entity');
      return 'Alert: Unprocessable entity';
    } else if (error.status == 423) {
      console.log('Locked');
      return 'Alert: Locked';
    } else if (error.status == 424) {
      console.log('Failed dependency');
      return 'Alert: Failed dependency';
    } else if (error.status == 425) {
      console.log('Too early');
      return 'Alert: Too early';
    } else if (error.status == 426) {
      console.log('Upgrade required');
      return 'Alert: Upgrade required';
    } else if (error.status == 428) {
      console.log('Precondition required');
      return 'Alert: Precondition required';
    } else if (error.status == 429) {
      console.log('Too many requests');
      return 'Alert: Too many requests';
    } else if (error.status == 431) {
      console.log('Request header fields too large');
      return 'Alert: Request header fields too large';
    } else if (error.status == 451) {
      console.log('Unavailable for legal reasons');
      return 'Alert: Unavailable for legal reasons';
    } else if (error.status == 500) {
      console.log('Internal server error');
      return 'Alert: ' + error.error.message;
    } else if (error.status == 501) {
      console.log('Not implemented');
      return 'Alert: Not implemented';
    } else if (error.status == 502) {
      console.log('Bad gateway');
      return 'Alert: Bad gateway';
    } else if (error.status == 503) {
      console.log('Service unavailable');
      return 'Alert: Service unavailable';
    } else if (error.status == 504) {
      console.log('Gateway timeout');
      return 'Alert: Gateway timeout';
    } else if (error.status == 505) {
      console.log('HTTP version not supported');
      return 'Alert: HTTP version not supported';
    } else if (error.status == 506) {
      console.log('Variant also negotiates');
      return 'Alert: Variant also negotiates';
    } else if (error.status == 507) {
      console.log('Insufficient storage');
      return 'Alert: Insufficient storage';
    } else if (error.status == 508) {
      console.log('Loop detected');
      return 'Alert: Loop detected';
    } else if (error.status == 510) {
      console.log('Not extended');
      return 'Alert: Not extended';
    } else if (error.status == 511) {
      console.log('Network authentication required');
      return 'Alert: Network authentication required';
    }
    else {
      console.log('Something went wrong');
      return 'Alert: Something went wrong';
    }

  }

}
