/// <mls fileReference="_102025_/l2/tsTestAST.ts" enhancement="_blank" />

export interface ICANTest {
    functionName: string,
    params: Record<string, any>[]
}

export interface ICANIntegration {
    enabled: boolean,
    description: string,
    page: string,
    functionName: string,
    schema: Record<string, ICANSchema>
}

export interface ICANSchema {
    type: string,
    optional?: boolean
    description?: string
}

