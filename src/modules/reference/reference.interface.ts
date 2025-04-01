export type TableReferenceResponse = {
  references: TableReference[];
};

export type TableReference = {
  table: string;
  label: string;
};
