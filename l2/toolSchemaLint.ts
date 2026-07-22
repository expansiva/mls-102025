/// <mls fileReference="_102025_/l2/toolSchemaLint.ts" enhancement="_blank" />

type JsonObject = Record<string, unknown>;

export function lintToolSchema(parametersJson: string): string[] | null {
    let root: unknown;
    try {
        root = JSON.parse(parametersJson);
    } catch (error) {
        return [`invalid JSON: ${error instanceof Error ? error.message : String(error)}`];
    }

    const errors: string[] = [];
    walkSchema(root, '', root, errors);
    return errors.length > 0 ? errors : null;
}

function walkSchema(node: unknown, path: string, root: unknown, errors: string[]) {
    if (!isObject(node)) return;

    validateNode(node, path || '/', root, errors);

    for (const key of Object.keys(node)) {
        const child = node[key];
        const childPath = joinPointer(path, key);

        if (Array.isArray(child)) {
            child.forEach((item, index) => walkSchema(item, joinPointer(childPath, String(index)), root, errors));
        } else {
            walkSchema(child, childPath, root, errors);
        }
    }
}

function validateNode(schema: JsonObject, path: string, root: unknown, errors: string[]) {
    if ((Object.prototype.hasOwnProperty.call(schema, 'enum') || Object.prototype.hasOwnProperty.call(schema, 'const')) && schema.type === undefined) {
        errors.push(`${path}: enum/const requires explicit type`);
    }

    if (Object.prototype.hasOwnProperty.call(schema, '$id')) {
        if (typeof schema.$id !== 'string') {
            errors.push(`${path}: $id must be a string`);
        } else if (!isValidUriReference(schema.$id)) {
            errors.push(`${path}: invalid $id "${schema.$id}"`);
        }
    }

    if (Object.prototype.hasOwnProperty.call(schema, '$ref')) {
        if (typeof schema.$ref !== 'string') {
            errors.push(`${path}: $ref must be a string`);
        } else if (schema.$ref.startsWith('#') && resolveLocalRef(root, schema.$ref) === undefined) {
            errors.push(`${path}: unresolved $ref "${schema.$ref}"`);
        }
    }

    if (Array.isArray(schema.type)) {
        errors.push(`${path}: type union arrays are not strict-compatible`);
    }

    if (schema.type === 'object') {
        if (!Object.prototype.hasOwnProperty.call(schema, 'additionalProperties')) {
            errors.push(`${path}: object schema must declare additionalProperties: false`);
        } else if (schema.additionalProperties !== false) {
            errors.push(`${path}: additionalProperties must be false`);
        }
    }
}

function resolveLocalRef(root: unknown, ref: string): unknown {
    const hashIndex = ref.indexOf('#');
    const fragment = hashIndex >= 0 ? ref.slice(hashIndex + 1) : ref;
    if (fragment === '') return root;
    if (!fragment.startsWith('/')) return undefined;

    let current = root;
    for (const rawSegment of fragment.slice(1).split('/')) {
        const segment = decodePointerSegment(rawSegment);
        if (Array.isArray(current)) {
            if (!/^(0|[1-9]\d*)$/.test(segment)) return undefined;
            current = current[Number(segment)];
        } else if (isObject(current) && Object.prototype.hasOwnProperty.call(current, segment)) {
            current = current[segment];
        } else {
            return undefined;
        }
    }
    return current;
}

function isValidUriReference(value: string): boolean {
    if (value === '' || value.startsWith('#') || value.startsWith('/') || value.startsWith('./') || value.startsWith('../')) {
        return isValidUriChars(value);
    }

    if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value)) {
        return isValidUriChars(value);
    }

    const firstSegment = value.split(/[/?#]/, 1)[0] ?? '';
    if (firstSegment.includes('.')) return false;
    return isValidUriChars(value);
}

function isValidUriChars(value: string): boolean {
    return /^[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/.test(value);
}

function joinPointer(base: string, segment: string): string {
    return `${base}/${encodePointerSegment(segment)}`;
}

function encodePointerSegment(segment: string): string {
    return segment.replace(/~/g, '~0').replace(/\//g, '~1');
}

function decodePointerSegment(segment: string): string {
    return segment.replace(/~1/g, '/').replace(/~0/g, '~');
}

function isObject(value: unknown): value is JsonObject {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
