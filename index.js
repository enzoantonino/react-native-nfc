'use strict';

import { NativeModules, DeviceEventEmitter, Platform } from 'react-native';

export const NfcDataType = {
    NDEF : "NDEF",
    TAG : "TAG"
};

export const NdefRecordType = {
    TEXT : "TEXT",
    URI : "URI",
    MIME : "MIME"
};


let _registeredToEvents = false;
let _registeredToStatusEvents = false;
const _listeners = [];
const _statusListeners = [];
const _commandListeners = [];

let _registerToEvents = () => {
    if(!_registeredToEvents){
        NativeModules.ReactNativeNFC.getStartUpNfcData(_notifyListeners);
        DeviceEventEmitter.addListener('__NFC_DISCOVERED', _notifyListeners);
        _registeredToEvents = true;
    }
};

let _registerToStatusEvents = () => {
    if(!_registeredToStatusEvents){
        DeviceEventEmitter.addListener('__NFC_STATUS_CHANGED', _notifyStatusListeners);
        _registeredToStatusEvents = true;
    }
};

let _notifyListeners = (data) => {
    if(data){
        for(let i in _listeners){
            _listeners[i](data);
        }
    }
};

let _notifyStatusListeners = (data) => {
    if(data){
        for(let i in _statusListeners){
            _statusListeners[i](data);
        }
    }
};

let _notifyCommandListeners = (data) => {
    if(data){
        for(let i in _commandListeners){
            _commandListeners[i](data);
        }
    }
};

const NFC = {};

NFC.addListener = (callback) => {
    if (Platform.OS === 'ios') {
        return;
    }
    _listeners.push(callback);
    _registerToEvents();
};

NFC.addStatusListener = (callback) => {
    if (Platform.OS === 'ios') {
        return;
    }
    _statusListeners.push(callback);
    _registerToStatusEvents();
};

NFC.removeStatusListeners = () => {
    _statusListeners = [];
};

NFC.removeAllListeners = () => {
    _listeners = [];
}

  //comandi: http://www.nxp.com/docs/en/data-sheet/NTAG213_215_216.pdf
NFC.readPage = (pageNum, callback) => {
    NativeModules.ReactNativeNFC.sendCommandWithCallback(["30",pageNum],callback); //READ
}

NFC.readUID = (callback) => {
    NativeModules.ReactNativeNFC.sendCommandWithCallback(["3A","0", "1"],(data) => { //FAST_READ
        if (data == null) {
            callback("");
            return;
        }
        //a noi servono i bytes 0-2 + 4-7
        let uid = data.substr(0,6)+""+data.substr(8,8);
        callback(uid);
    });
}

NFC.readVersion = (callback) => {
    NativeModules.ReactNativeNFC.sendCommandWithCallback(["60"],callback); //GET_VERSION
}

NFC.readSignature = (callback) => {
    NativeModules.ReactNativeNFC.sendCommandWithCallback(["3C","0"],callback); //READ_SIG
}

NFC.isTagAvailable = (callback) => {
    NativeModules.ReactNativeNFC.isTagAvailable(callback);
}

NFC.isEnabled = (callback) => {
    NativeModules.ReactNativeNFC.isEnabled(callback);
}


export default NFC;
