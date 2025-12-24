import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-simple-table',
  templateUrl: './simple-table.component.html',
  styleUrls: ['./simple-table.component.scss']
})
export class SimpleTableComponent {

  @Input() columns: any[] = []
  @Input() tableData: any[] = []
  @Input() isloading: boolean = false
  @Input() title: string = ''

  @Input() cjpcStatus:string=''
  @Output() handleEdit = new EventEmitter<any>();
  @Output() handleView = new EventEmitter<any>();
  @Output() handleDelete = new EventEmitter<any>();
  @Output() deleteDocument = new EventEmitter<any>();
  @Output() downloadDocument = new EventEmitter<any>();
  @Output() handleClickHere = new EventEmitter<{ columnName: string, rowData: any }>();

  deletedItem: any;
  deletedItemDoc: any;

  Download(row: any) {

    this.downloadDocument.emit(row)
    console.log('file download', row, this.downloadDocument);
  }
  onEdit(row: any) {
    // console.log('Edit', row)
    this.handleEdit.emit(row)
  }
  onHoldRelease(row:any){
    this.handleClickHere.emit(row)
  }
  onView(row: any) {
    // console.log('View', row)
    this.handleView.emit(row)
  }

  onDelete(row: any) {
    // console.log('Delete', row)
    this.deletedItem = row;

  }

  onDeleteDoc(row: any) {
    console.log('Delete', row)
    // this.deletedItemDoc = row;
    this.deleteDocument.emit(row);
  }

  onClickHere(col: any, row: any) {
    // this.handleClickHere.emit(row)
    this.handleClickHere.emit({ columnName: col, rowData: row })
  }
  
  confirmDelete() {
    // console.log('Delete', this.deletedItem)
    this.handleDelete.emit(this.deletedItem);
  }
  onDeleteWithRemark(row: any) {
    this.handleDelete.emit(row);
  }

}
