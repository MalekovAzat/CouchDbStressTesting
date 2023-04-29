export interface ExpConfig {
  doc_count: number;
  local_client_count: number;
  remote_client_count: number;
  json_size_bite: number;
  batch_size: number;
  local_db_directory_path: string;
  remote_server_path: string;
  output_file: string;
  rewriting_persentage: number;
  output_directory: string;
}

export interface CommandLineConfig
  extends Omit<ExpConfig, "local_client_count" | "remote_client_count"> {
  local_client_count: [number];
  remote_client_count: [number];
}

export const CommandLineArgsConfig = [
  { name: "doc_count", type: Number },
  { name: "local_client_count", type: Number, multiple: true },
  { name: "remote_client_count", type: Number, multiple: true },
  { name: "json_size_bite", type: Number },
  { name: "batch_size", type: Number },
  { name: "local_db_directory_path", type: String },
  { name: "remote_server_path", type: String },
  { name: "output_file", type: String },
  { name: "rewriting_persentage", type: Number },
  { name: "output_directory", type: String },
];
