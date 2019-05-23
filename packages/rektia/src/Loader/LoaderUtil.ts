import * as glob from "glob";

interface ReadRequireableFileOption {
  recursive: boolean;
  ignore: string;
}

export const readRequireableFiles = async (
  dir: string,
  options: Partial<ReadRequireableFileOption> = { recursive: false }
) => {
  const loadableExtensions = Object.keys(require.extensions).join(",");
  const pattern = options.recursive
    ? `${dir}/**/*{${loadableExtensions}}`
    : `${dir}/*{${loadableExtensions}}`;
  return glob.sync(pattern, { ignore: options.ignore });
};
