"use strict";
const crypto = require('crypto');
/*
 * Return a salted and hashed password entry from a
 * clear text password.
 * @param {string} clearTextPassword
 * @return {object} passwordEntry
 * where passwordEntry is an object with two string
 * properties:
 *      salt - The salt used for the password.
 *      hash - The sha1 hash of the password and salt
 */
function makePasswordEntry(clearTextPassword) {
    const hash_func = crypto.createHash('sha1');
    const salt = crypto.randomBytes(8).toString('hex');
    hash_func.update(clearTextPassword + salt);
    const hash = hash_func.digest('hex');

    let passwordEntry = {
        salt: salt,
        hash: hash,
    };
    return passwordEntry;
}


/*
 * Return true if the specified clear text password
 * and salt generates the specified hash.
 * @param {string} hash
 * @param {string} salt
 * @param {string} clearTextPassword
 * @return {boolean}
 */
function doesPasswordMatch(hash, salt, clearTextPassword) {
    const hash_func = crypto.createHash('sha1');
    hash_func.update(clearTextPassword + salt);
    if (hash !== hash_func.digest('hex')){
        return false;
    }
    return true;
}

// Test code
const assert = require('assert');
let p1 = makePasswordEntry("weak");
let p2 = makePasswordEntry("weak");
assert(p1.hash.length === 40, p1.hash.length);
assert(p1.hash !== p2.hash);
assert(p1.salt !== p2.salt);
assert(doesPasswordMatch(p1.hash,p1.salt,'weak'));
assert(!doesPasswordMatch(p1.hash,p1.salt,'weak2'));
assert(doesPasswordMatch(p2.hash,p2.salt,'weak'));
assert(!doesPasswordMatch(p1.hash,p2.salt,'weak'));



module.exports = {
    makePasswordEntry: makePasswordEntry,
    doesPasswordMatch: doesPasswordMatch,
};
