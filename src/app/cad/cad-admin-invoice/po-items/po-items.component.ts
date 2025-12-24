import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-po-items',
  templateUrl: './po-items.component.html',
  styleUrls: ['./po-items.component.scss']
})
export class PoItemsComponent {
  items = [
    { id: '00001', description: 'GYPSUM - CHEMICAL', materialNumber: '108000000046', unitMeasure: '1', plantCode: 'NE02', netPrice: 50, pricePerUnit: 1, quantity: '22' },
    { id: '00002', description: 'GYPSUM - CHEMICAL', materialNumber: '108000000047', unitMeasure: '1', plantCode: 'NE03', netPrice: 50, pricePerUnit: 1, quantity: '22' },
    { id: '00003', description: 'GYPSUM - CHEMICAL', materialNumber: '108000000048', unitMeasure: '1', plantCode: 'NE04', netPrice: 50, pricePerUnit: 1, quantity: '22' },
    { id: '00004', description: 'GYPSUM - CHEMICAL', materialNumber: '108000000049', unitMeasure: '1', plantCode: 'NE05', netPrice: 50, pricePerUnit: 1, quantity: '22' }
  ];

  selectedItems: any[] = [];
  @Input() poItems:any[] =[];
  pages: number[] = [];
    totalPages: number = 0;
    currentPage: number = 1;
    totalItems: number = 0;
    itemsPerPage: number = 10;
    public pagedData: any[] = [];
    visiblePages: number[] = [];
    filterTableData: any[] = [];
  simpleTableColumns = [
    { header: 'Purchase Order Number', field: 'purchaseOrderNumber' },
    { header: 'HSN/SAC Code', field: 'code' },
    { header: 'Quantity', field: 'quantity' },
    { header: 'Rate', field: 'rate', },
    { header: 'Net Amount', field: 'netAmount', },
    { header: 'Tax', field: 'tax' },
    { header: 'Gross Amount', field: 'grossAmount', }
  ];

  simpleTableDetails = [
    {
      purchaseOrderNumber: '01 - Dec - 2024',
      code: '--',
      quantity: '--',
      rate: '--',
      netAmount: '--',
      tax: '--',
      grossAmount: '--'
    },
  ]
 
  ngOnInit(){
    console.log('poItems',this.poItems)
    this.totalItems = this.poItems.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updatePagination();
  }
  toggleSelection(item: any, event?: any) {
    if (event.target.checked) {
      this.pagedData.map((i: any) => {
        if (i.purchaseOrderItemNo === item.purchaseOrderItemNo) {
          i.isSelected = true;
        }
      });
      this.selectedItems.push({ ...item, updatedQuantity: item.quantity, grossAmount: 0, isSelected: true });
    } else {
      this.pagedData.map((i: any) => {
        if (i.purchaseOrderItemNo === item.purchaseOrderItemNo) {
          i.isSelected = false;
        }
      });
      this.selectedItems = this.selectedItems.filter(i => i.purchaseOrderItemNo !== item.purchaseOrderItemNo);
    }
  }

  isAllSelected(): boolean {
    return this.pagedData.every(item =>
      this.selectedItems.some(i => i.purchaseOrderItemNo === item.purchaseOrderItemNo)
    );
  }

  // Toggle all selections for current page
  toggleAllSelection(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    this.pagedData.forEach(item => {
      if (checked) {
        item.isSelected = true;
        if (!this.selectedItems.some(i => i.purchaseOrderItemNo === item.purchaseOrderItemNo)) {
          this.selectedItems.push({ ...item, updatedQuantity: item.quantity, grossAmount: 0, isSelected: true });
        }
      } else {
        item.isSelected = false;
        this.selectedItems = this.selectedItems.filter(i => i.purchaseOrderItemNo !== item.purchaseOrderItemNo);
      }
    });
  }

  updatePagination() {
    this.totalItems = this.poItems.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pagedData = this.poItems.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );

    this.generatePageNumbers();
  }

  generatePageNumbers() {
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.visiblePages = this.getVisiblePages();
  }

  getVisiblePages(): number[] {
    const range = 2; // Show 2 pages before and after the current page
    let start = Math.max(1, this.currentPage - range);
    let end = Math.min(this.totalPages, this.currentPage + range);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const key = event.key;
    return /^\d$/.test(key);
  }
   onPageChange(event: any): void {
    const selectedPage = event.target.value;
    this.currentPage = parseInt(selectedPage);
    this.updatePagination();
    this.getVisiblePages();
  }
}
