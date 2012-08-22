/**
 * @param {all} obj
 * @param {boolean=} strict, 
 	if true, method _type will only return a certain type from the type_list
 
 * NEVER use K._type(undefined)
 * for undefined/null, use obj === undefined / obj === null instead
 
 * for host objects, always return 'object'
 */
function _type(obj, strict){
	return type_map[ toString.call(obj) ] || !strict && obj && 'object' || undef;
};


var 

undef,

toString = Object.prototype.toString,
	
// basic javascript types
// never include any host types or new types of javascript variables for compatibility
type_list = 'Boolean Number String Function Array Date RegExp Object'.split(' '),
i = type_list.length,

type_map = {},
name,
name_lower, 
isObject;
	

while( i -- ){
	name = type_list[i];
	name_lower = name.toLowerCase();
	
	type_map[ '[object ' + name + ']' ] = name_lower;
	
	exports['is' + name] = name === 'Object' ?
	
		// Object.prototype.toString in IE:
		// undefined 	-> [object Object]
		// null 		-> [object Object]
		isObject = function(nl){
			return function(o){
				return !!o && _type(o) === nl;
			}
		}(name_lower)
	:
		function(nl){
			return function(o){
				return _type(o) === nl;
			}
		}(name_lower);
}


/**
 * whether an object is created by '{}', new Object(), or new myClass() [1]
 * to put the first priority on performance, just make a simple method to detect plainObject.
 * so it's imprecise in many aspects, which might fail with:
 *	- location
 *	- other obtrusive changes of global objects which is forbidden
 */
exports.isPlainObject = function(obj){

	// undefined 	-> false
	// null			-> false
	return !!obj && toString.call(obj) === '[object Object]' && 'isPrototypeOf' in obj;
};


/**
 * simple method to detect DOMWindow in a clean world that has not been destroyed
 */
exports.isWindow = function(obj){

	// toString.call(window):
	// [object Object]	-> IE
	// [object global]	-> Chrome
	// [object Window]	-> Firefox
	
	// isObject(window)	-> 'object'
	return isObject(obj) && 'setInterval' in obj; 
};


/**
 * never use isNaN function, use NR.isNaN instead.  NaN === NaN // false
 * @return {boolean} 
 	true, if Number(obj) is NaN
 	
 * ref:
 * http://es5.github.com/#x15.1.2.4
 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/isNaN
 */
// TODO
// exports.isNaN = function(obj){
//	return obj == null || !/\d/.test( obj ) || isNaN( obj );
// };