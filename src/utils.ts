export function log(something: unknown) {
    if (typeof something === 'string') {
        console.log(something);
        return;
    }

    if (typeof something === 'object') {
        console.log(JSON.stringify(something, null, 2));
        return;
    }
}
