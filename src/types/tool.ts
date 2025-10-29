/**
 * Tool result content - MCP protocol structure
 */
export type ToolContent = {
  type: 'text' | 'image' | 'resource';
  text?: string;
  data?: string;
  mimeType?: string;
};

/**
 * Tool execution result
 */
export type ToolResult = {
  content: ToolContent[];
  isError?: boolean;
};

/**
 * Tool definition conforming to MCP protocol
 */
export type Tool = {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  };
  execute: (args: unknown) => Promise<ToolResult>;
};

/**
 * Tool factory function signature
 */
export type ToolFactory<TDependency = unknown> = (dependency: TDependency) => Tool[];
