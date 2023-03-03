import merge from 'deepmerge';
import {isPlainObject} from 'is-plain-object';
import deepEqual from 'fast-deep-equal';

const deepMerge = (a, b, o = {isMergeableObject: isPlainObject}) =>
	(deepEqual(a, b) || b === undefined) ? a : (a !== Object(a) || b !== Object(b)) ? b : merge(a, b, o);

export default deepMerge;