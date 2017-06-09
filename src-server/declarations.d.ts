declare module 'require-without-cache' {
    const _: (module: string, require: NodeRequire) => any;
    export = _
}

declare module 'module-alias';
