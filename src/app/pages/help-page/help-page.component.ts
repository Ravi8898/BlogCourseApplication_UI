import { Component } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-help-page',
  templateUrl: './help-page.component.html',
  styleUrls: ['./help-page.component.scss']
})
export class HelpPageComponent {

  toastMsg:any = '';
  errorToast:any = false;
  successToast:any = false;

  manualList :any = [];
  pdfSrc :any = '';
  playVideoStatus = false;
  videoUrl :any;

  constructor(private commonService:CommonService){
    let url = 'C:/EAP-7.4.0/vspeed_help/document/conditionalVendor.pdf';
    let url_video = 'C:/EAP-7.4.0/vspeed_help/video/demo.mp4';
    this.manualList = [
      {'title':'Material Invoice Upload Documentation', 'content':'Material Invoice Upload Document is a documentation of complete process of invoice upload with mandatory field and its description', 'url':url, 'type':'file', 'invoicetype':'material'},
      {'title':'Material Invoice Upload Video', 'content':'Material Invoice Upload Document is a documentation of complete process of invoice upload with mandatory field and its description', 'url':url_video, 'type':'video', 'invoicetype':'material'},
      // {'title':'Service Invoice Upload Documentation', 'content':'Service Invoice Upload Document is a documentation of complete process of invoice upload with mandatory field and its description', 'url':url, 'type':'file', 'invoicetype':'service'},
      // {'title':'service Invoice Upload Video', 'content':'Service Invoice Upload Document is a documentation of complete process of invoice upload with mandatory field and its description', 'url':url_video, 'type':'video', 'invoicetype':'service'},
      {'title':'Conditional Invoice Upload Documentation', 'content':'Conditional Invoice Upload Document is a documentation of complete process of invoice upload with mandatory field and its description', 'url':url, 'type':'file', 'invoicetype':'conditional'},
      {'title':'Conditional Invoice Upload Video', 'content':'Conditional Invoice Upload Document is a documentation of complete process of invoice upload with mandatory field and its description', 'url':url_video, 'type':'video', 'invoicetype':'conditional'},
    ]
  }

  ngOnInit():void {
    this.getUserManual();
  }

  getUserManual(){
    
  }

  viewOrDownloadDocument(item:any, action:any){
    console.log('viewOrDownloadDocument');

    this.commonService.spinner.show();
    this.pdfSrc = '';

    let url = `getBase64FromPath?filePath=${item.url}`;
    this.commonService.dataGet(url).subscribe((res:any)=>{
    // this.commonService.viewAttachment(item.url).subscribe((res:any)=>{
      console.log(res);
      if(res && res['status']=='Success' && res['data']){
        if(action == 'view'){
          this.pdfSrc = res['data'];
          document.getElementById('approvalModalButton')?.click();
          this.commonService.spinner.hide();
        }else if(action == 'download'){
          let link = document.createElement('a');
          link.href = `data:application/pdf;base64,${res['data']}`;
          link.download = `download.pdf`;
          link.click();
          this.commonService.spinner.hide();
        }
      }else{
        this.errorToast = true;
        this.toastMsg = 'PDF file not exist';
        setTimeout(()=>{
          this.errorToast = false;
        },2000);
        this.commonService.spinner.hide();
      }
    },err=>{
      this.errorToast = true;
      this.toastMsg = 'PDF file not exist';
      setTimeout(()=>{
        this.errorToast = false;
      },2000);
      this.commonService.spinner.hide();
    })
  }

  playOrDownloadVideo(item:any, action:any){
    console.log('playOrDownloadVideo');

    this.commonService.spinner.show();
    let url = `getBase64FromPath?filePath=${item.url}`;
    this.commonService.dataGet(url).subscribe((res:any)=>{
    // this.commonService.viewAttachment(item.url).subscribe((res:any)=>{
      console.log(res);
      if(res && res['status']=='Success' && res['data']){

        let videoURL = `data:video/mp4;base64,${res['data']}`;
        if(action == 'play'){
          const newTab = window.open('', '_blank');
          if(newTab){
            newTab.document.write(`
              <!doctype html>
              <html lang="en">
              <head>
                <meta charset="utf-8">
                <title>video view</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
              </head>
              <body>
                <video width="100%" height="auto" controls mute loop autoplay>
                  <source src="${videoURL}" type="video/mp4">
                </video>
              </body>
              </html>
            `)
          }
          this.commonService.spinner.hide();
        }else if(action == 'download'){
          let link = document.createElement('a');
          // link.href = `data:application/pdf;base64,${res['data']}`;
          link.href = videoURL;
          link.download = `video.mp4`;
          link.click();
          this.commonService.spinner.hide();
        }        
      }else{
        this.errorToast = true;
        this.toastMsg = 'PDF file not exist';
        setTimeout(()=>{
          this.errorToast = false;
        },2000);
        this.commonService.spinner.hide();
      }
    },err=>{
      this.errorToast = true;
      this.toastMsg = 'PDF file not exist';
      setTimeout(()=>{
        this.errorToast = false;
      },2000);
      this.commonService.spinner.hide();
    })
  }
}
