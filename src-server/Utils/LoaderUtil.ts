import * as glob from 'glob'

export const readRequireableFiles = async (dir: string, options: {recursive: boolean} = {recursive: false}) => {
    const loadableExtensions = Object.keys(require.extensions).join(",")
    const pattern = options.recursive ? `${dir}/**/*{${loadableExtensions}}` : `${dir}/*{${loadableExtensions}}`
    return glob.sync(pattern)
}
