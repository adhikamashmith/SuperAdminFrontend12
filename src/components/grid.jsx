import React from "react";
import { AgGridReact } from "ag-grid-react";
import {
  themeAlpine,
  themeMaterial,
  ClientSideRowModelModule,
  TextEditorModule,
  NumberEditorModule,
  ValidationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  PaginationModule,
} from "ag-grid-community";

const modules = [
  ClientSideRowModelModule,
  TextEditorModule,
  NumberEditorModule,
  ValidationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  PaginationModule,
];

export default function Grid({ rowData, colDefs, loading }) {
  return (
    <div className="w-full h-full">
      <AgGridReact
        theme={themeMaterial}
        modules={modules}
        rowData={rowData}
        columnDefs={colDefs}
        pagination={true}
        paginationPageSize={20}
        paginationPageSizeSelector={[10, 20, 50, 100]}
        loading={loading}
      />
    </div>
  );
}
