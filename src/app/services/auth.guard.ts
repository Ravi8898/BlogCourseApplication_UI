import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { CommonService } from './common.service';

export const authGuard: CanActivateFn = (route, state) => {
  // return true;
  let username = localStorage.getItem('username');
  // if(username){
  if (localStorage.getItem('username')) {
    // let path = route['routeConfig']?.['path'];
    if (!username) {
    inject(CommonService).routeToPage('');
    return false;
  }
    let path = state?.['url'];
     if (path.includes('/All-Master')) {
    const roleName = localStorage.getItem('roleName');
    // Allow if user has AllFrieghtMaster role OR if it's a specific freigth-related path
    if (roleName === 'AllFrieghtMaster' ||
        path.includes('/All-Master/frieght') ||
        path.includes('/All-Master/add-frieght-bill')) {
      return true;
    }
  }
    if (path.includes('admin') || path.includes('CAD') && localStorage.getItem('adminAccess') == 'true') {
      // if(localStorage.getItem('adminAccess')){
      return true;
    }
    // else if((path.includes('storesincharge') || path.includes('material-incharge') || path.includes('reward-incharge') || path.includes('service-incharge') || path.includes('sla-incharge')) && localStorage.getItem('logintype')=='sitecontroller' && !localStorage.getItem('roleName')){
    else if ((path.includes('incharge')) && localStorage.getItem('logintype') == 'sitecontroller' && localStorage.getItem('roleName') == 'SiteController') {
      return true
      // }else if(path.includes('purchase') || path.includes('material-invoice') || path.includes('freight-inbound') || path.includes('conditional-vendor') ||  path.includes('service-invoice') || path.includes('sla-invoice') || path.includes('reward-invoice') && localStorage.getItem('logintype')=='vendor'){
    // } else if ((path.includes('conditional-incharge')) && localStorage.getItem('logintype') == 'sitecontroller' && localStorage.getItem('roleName')) {
    }else if((path.includes('raw-material-incharge')) && localStorage.getItem('logintype')=='sitecontroller' && localStorage.getItem('roleName')){
      return true
    } else if (path.includes('purchase') || path.includes('invoice') || path.includes('freight-inbound') && localStorage.getItem('logintype') == 'vendor') {
      return true
    } else if (path.includes('profile')) {
      return true
    }
    else if (path.includes('profile') && localStorage.getItem('logintype') == 'Project Manager') {
      return true
    }
    else if ((path == '/dashboard' || path == '/dashboard/home') && !localStorage.getItem('adminAccess') && !localStorage.getItem('roleName')) {
      return true
    } else if ((path == '/dashboard' || path == '/dashboard/logistic' || path.includes('/CAD')) && localStorage.getItem('adminAccess') == 'false' && localStorage.getItem('roleName')) {
      return true
    } else if (path == '/dashboard' || path == '/dashboard/home' && localStorage.getItem('roleName')) {
      return true
    }else if((path=='/dashboard' || path=='/dashboard/logistic') && localStorage.getItem('adminAccess') == 'false' && localStorage.getItem('roleName')){
      return true
    }else if(path=='/dashboard' || path=='/dashboard/home' && localStorage.getItem('roleName')){
      return true
    }
    else if(path=='/dashboard' || path=='/material-invoice' && localStorage.getItem('roleName')=='BusinessUser'){
      return true
    }
    else if(path=='/dashboard/all' && localStorage.getItem('logintype')=='vendor' && localStorage.getItem('roleName')=='PRIMARY'){
      return true
    } else if (path == '/CAD' || path == '/CAD/vendor' || path == '/CAD/vendor/home' || path == '/CAD/vendor/home/hold-list') {
      return true
    } else if(path == '/paperless-work'|| path == '/paperless-work/vendor/invoice'||path == '/paperless-work/vendor-home'||path == '/paperless-work/home/invoice'  || path == '/paperless-work/home'){
      return true
    }
     else if (path.includes('/CAD')) {
      return true
    } else if (path == '/All-Master' || path == '/All-Master/all-master-data' || path == '/All-Master/add-bill' || path == '/All-Master/add-bill/:id' || path == '/All-Master/add-fi-data' || path == '/All-Master/add-fi-data/:id' || path == '/All-Master/frieght' || path == '/All-Master/add-frieght-bill' && localStorage.getItem('roleName') == 'AllFrieghtMaster') {
      return true
    } else {
      return false
    }
    // return true;
  } else {
    // inject(CommonService).routeToLogin();
    inject(CommonService).routeToPage('');
    return false;
  }
};
