declare module 'JSONStream' {
    import { Transform } from 'stream';

    function parse(path: string): Transform;
    function stringify(): Transform;

    export { parse, stringify };
}
