export default function pascalize(str) {
    // Replace (pascalize) "some", "some-name", "some_name" to "Some", "SomeName"
    return str.replace(/([-_])(.)/g, (match, p1, p2) => p2.toUpperCase())
        .replace(/^(.)/, (match, p1) => p1.toUpperCase());
}
