/*
 * @author: tisfeng
 * @createTime: 2022-06-26 11:13
 * @lastEditor: tisfeng
 * @lastEditTime: 2022-06-26 22:43
 * @fileName: utils.ts
 *
 * Copyright (c) 2022 by tisfeng, All Rights Reserved.
 */

import { Clipboard, environment, getApplications, getPreferenceValues, LocalStorage } from "@raycast/api";
import { eudicBundleId } from "./components";
import { clipboardQueryTextKey, languageItemList } from "./consts";
import { LanguageItem, MyPreferences, QueryRecoredItem, TranslateFormatResult } from "./types";
import CryptoJS from "crypto-js";

// Time interval for automatic query of the same clipboard text, avoid frequently querying the same word. Default 10min
export const clipboardQueryInterval = 10 * 60 * 1000;

export const maxLineLengthOfChineseTextDisplay = 45;
export const maxLineLengthOfEnglishTextDisplay = 95;

export const myPreferences: MyPreferences = getPreferenceValues();
export const defaultLanguage1 = getLanguageItemFromYoudaoId(myPreferences.language1) as LanguageItem;
export const defaultLanguage2 = getLanguageItemFromYoudaoId(myPreferences.language2) as LanguageItem;

const defaultEncrytedYoudaoAppId = "U2FsdGVkX19SpBCGxMeYKP0iS1PWKmvPeqIYNaZjAZC142Y5pLrOskw0gqHGpVS1";
const defaultEncrytedYoudaoAppKey =
  "U2FsdGVkX1/JF2ZMngmTw8Vm+P0pHWmHKLQhGpUtYiDc0kLZl6FKw1Vn3hMyl7iL7owwReGJCLsovDxztZKb9g==";
export const defaultYoudaoAppId = myDecrypt(defaultEncrytedYoudaoAppId);
export const defaultYoudaoAppSecret = myDecrypt(defaultEncrytedYoudaoAppKey);

const defaultEncryptedBaiduAppId = "U2FsdGVkX1/QHkSw+8qxr99vLkSasBfBRmA6Kb5nMyjP8IJazM9DcOpd3cOY6/il";
const defaultEncryptedBaiduAppSecret = "U2FsdGVkX1+a2LbZ0+jntJTQjpPKUNWGrlr4NSBOwmlah7iP+w2gefq1UpCan39J";
export const defaultBaiduAppId = myDecrypt(defaultEncryptedBaiduAppId);
export const defaultBaiduAppSecret = myDecrypt(defaultEncryptedBaiduAppSecret);

const defaultEncryptedTencentSecretId =
  "U2FsdGVkX19lHBVXE+CEZI9cENSToLIGzHDsUIE+RyvIC66rgxumDmpYPDY4MdaTSbrq7MIyDvtgXaLvzijYSg==";
const defaultEncryptedTencentSecretKey =
  "U2FsdGVkX1+N6wDYXNiUISwKOM97cY03RjXmC+0+iodFo3b4NTNC1J8RR6xqcbdyF7z3Z2yQRMHHxn4m02aUvA==";
export const defaultTencentSecretId = myDecrypt(defaultEncryptedTencentSecretId);
export const defaultTencentSecretKey = myDecrypt(defaultEncryptedTencentSecretKey);

const defaultEncryptedCaiyunToken = "U2FsdGVkX1+ihWvHkAfPMrWHju5Kg4EXAm1AVbXazEeHaXE1jdeUzZZrhjdKmS6u";
export const defaultCaiyunToken = myDecrypt(defaultEncryptedCaiyunToken);

export function getLanguageItemFromYoudaoId(youdaoLanguageId: string): LanguageItem {
  for (const langItem of languageItemList) {
    if (langItem.youdaoLanguageId === youdaoLanguageId) {
      return langItem;
    }
  }
  return languageItemList[0];
}

export function getLanguageItemFromTencentId(tencentLanguageId: string): LanguageItem | undefined {
  for (const langItem of languageItemList) {
    const tencentDetectLanguageId = langItem.tencentDetectLanguageId || langItem.tencentLanguageId;
    if (tencentDetectLanguageId === tencentLanguageId) {
      return langItem;
    }
  }
}

/**
 * return language item from apple Chinese title, such as "中文" --> LanguageItem
 *
 * Todo: support other languages, currently only support Chinese
 */
export function getLanguageItemFromAppleChineseTitle(chineseTitle: string): LanguageItem | undefined {
  for (const langItem of languageItemList) {
    if (langItem.appleChineseLanguageTitle === chineseTitle) {
      return langItem;
    }
  }
}

/**
 * get another language item except chinese
 */
export function getLanguageItemExceptChinese(from: LanguageItem, to: LanguageItem): LanguageItem {
  if (from.youdaoLanguageId === "zh-CHS") {
    return to;
  } else {
    return from;
  }
}

/**
 * get another language item expcept chinese from language item array
 */
export function getLanguageItemOfTwoExceptChinese(languageItems: [LanguageItem, LanguageItem]): LanguageItem {
  if (languageItems[0].youdaoLanguageId === "zh-CHS") {
    return languageItems[1];
  } else {
    return languageItems[0];
  }
}

/**
 * Determine whether the title of the result exceeds the maximum value of one line.
 */
export function isTranslateResultTooLong(formatResult: TranslateFormatResult | null): boolean {
  if (!formatResult) {
    return false;
  }

  const isChineseTextResult = formatResult.queryWordInfo.toLanguage === "zh-CHS";
  const isEnglishTextResult = formatResult.queryWordInfo.toLanguage === "en";

  for (const translation of formatResult.translations) {
    const textLength = translation.text.length;
    if (isChineseTextResult) {
      if (textLength > maxLineLengthOfChineseTextDisplay) {
        return true;
      }
    } else if (isEnglishTextResult) {
      if (textLength > maxLineLengthOfEnglishTextDisplay) {
        return true;
      }
    } else if (textLength > maxLineLengthOfEnglishTextDisplay) {
      return true;
    }
  }
  return false;
}

export function getEudicWebTranslateURL(queryText: string, from: LanguageItem, to: LanguageItem): string {
  // const eudicWebLanguageId = getLanguageItemExceptChinese(from, to).eudicWebLanguageId;
  const eudicWebLanguageId = getLanguageItemOfTwoExceptChinese([from, to]).eudicWebLanguageId;
  if (eudicWebLanguageId) {
    return `https://dict.eudic.net/dicts/${eudicWebLanguageId}/${encodeURI(queryText)}`;
  }
  return "";
}

export function getYoudaoWebTranslateURL(queryText: string, from: LanguageItem, to: LanguageItem): string {
  // const youdaoWebLanguageId = getLanguageItemExceptChinese(from, to).youdaoWebLanguageId;
  const youdaoWebLanguageId = getLanguageItemOfTwoExceptChinese([from, to]).youdaoWebLanguageId;

  if (youdaoWebLanguageId) {
    return `https://www.youdao.com/w/${youdaoWebLanguageId}/${encodeURI(queryText)}`;
  }
  return "";
}

export function getGoogleWebTranslateURL(queryText: string, from: LanguageItem, to: LanguageItem): string {
  const fromLanguageId = from.googleLanguageId || from.youdaoLanguageId;
  const toLanguageId = to.googleLanguageId || to.youdaoLanguageId;
  const text = encodeURI(queryText);
  return `https://translate.google.cn/?sl=${fromLanguageId}&tl=${toLanguageId}&text=${text}&op=translate`;
}

/**
 * query the clipboard text from LocalStorage
 * * deprecate
 */
export async function tryQueryClipboardText(queryClipboardText: (text: string) => void) {
  const text = await Clipboard.readText();
  console.log("query clipboard text: " + text);
  if (text) {
    const jsonString = await LocalStorage.getItem<string>(clipboardQueryTextKey);
    console.log("query jsonString: " + jsonString);
    if (!jsonString) {
      queryClipboardText(text);
    }

    if (jsonString) {
      const queryRecoredItem: QueryRecoredItem = JSON.parse(jsonString);
      const timestamp = queryRecoredItem.timestamp;
      const queryText = queryRecoredItem.queryText;
      if (queryText === text) {
        const now = new Date().getTime();
        console.log(`before: ${new Date(timestamp).toUTCString()}`);
        console.log(`now:    ${new Date(now).toUTCString()}`);
        if (!timestamp || now - timestamp > clipboardQueryInterval) {
          queryClipboardText(text);
        }
      } else {
        queryClipboardText(text);
      }
    }
  }
}

/**
 * save last Clipboard text and timestamp
 */
export function saveQueryClipboardRecord(text: string) {
  const jsonString: string = JSON.stringify({
    queryText: text,
    timestamp: new Date().getTime(),
  });
  LocalStorage.setItem(clipboardQueryTextKey, jsonString);
  console.log("saveQueryClipboardRecord: " + jsonString);
}

/**
 * return and update the autoSelectedTargetLanguage according to the languageId
 */
export function getAutoSelectedTargetLanguageId(accordingLanguageId: string): string {
  let targetLanguageId = "auto";
  if (accordingLanguageId === defaultLanguage1.youdaoLanguageId) {
    targetLanguageId = defaultLanguage2.youdaoLanguageId;
  } else if (accordingLanguageId === defaultLanguage2.youdaoLanguageId) {
    targetLanguageId = defaultLanguage1.youdaoLanguageId;
  }

  const targetLanguage = getLanguageItemFromYoudaoId(targetLanguageId);

  console.log(`languageId: ${accordingLanguageId}, auto selected target: ${targetLanguage.youdaoLanguageId}`);
  return targetLanguage.youdaoLanguageId;
}

/**
 * traverse all applications, check if Eudic is installed
 */
async function traverseAllInstalledApplications(updateIsInstalledEudic: (isInstalled: boolean) => void) {
  const installedApplications = await getApplications();
  LocalStorage.setItem(eudicBundleId, false);
  updateIsInstalledEudic(false);

  for (const application of installedApplications) {
    console.log(application.bundleId);
    if (application.bundleId === eudicBundleId) {
      updateIsInstalledEudic(true);
      LocalStorage.setItem(eudicBundleId, true);

      console.log("isInstalledEudic: true");
    }
  }
}

export function checkIsInstalledEudic(setIsInstalledEudic: (isInstalled: boolean) => void) {
  LocalStorage.getItem<boolean>(eudicBundleId).then((isInstalledEudic) => {
    console.log("is install Eudic: ", isInstalledEudic);

    if (isInstalledEudic == true) {
      setIsInstalledEudic(true);
    } else if (isInstalledEudic == false) {
      setIsInstalledEudic(false);
    } else {
      traverseAllInstalledApplications(setIsInstalledEudic);
    }
  });
}

export function myEncrypt(text: string) {
  // console.warn("encrypt:", text);
  const ciphertext = CryptoJS.AES.encrypt(text, environment.extensionName).toString();
  // console.warn("ciphertext: ", ciphertext);
  return ciphertext;
}

export function myDecrypt(ciphertext: string) {
  // console.warn("decrypt:", ciphertext);
  const bytes = CryptoJS.AES.decrypt(ciphertext, environment.extensionName);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  // console.warn("originalText: ", originalText);
  return originalText;
}

export function isShowMultipleTranslations(formatResult: TranslateFormatResult) {
  return !formatResult.explanations && !formatResult.forms && !formatResult.webPhrases && !formatResult.webTranslation;
}
