import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  exports:[
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    MatExpansionModule
  ]
})
export class AngularMaterialModule { }
