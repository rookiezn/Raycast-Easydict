import { SectionType } from "./consts";

export interface ITranslateResult {
  l: string;
  query: string;
  returnPhrase: [];
  errorCode: string;
  translation: string[];
  web?: ITranslateResultWebItem[];
  basic?: ITranslateResultBasicItem;
}

export interface ITranslateReformatResult {
  type: SectionType;
  children?: ITranslateReformatResultItem[];
}

export interface ITranslateReformatResultItem {
  key: string;
  title: string;
  copyText: string;
  subtitle?: string;
  phonetic?: string;
  examTypes?: string[];
}

export interface ITranslateResultWebItem {
  key: string;
  value: string[];
}

export interface ITranslateResultBasicItem {
  explains: string[];
  phonetic?: string;
  "us-phonetic": string;
  "uk-phonetic": string;
  exam_type?: string[];
  wfs?: ITranslateResultBasicWfsItem[];
}

export interface ITranslateResultBasicWfsItem {
  wf?: ITranslateResultBasicWfItem;
}

export interface ITranslateResultBasicWfItem {
  name: string;
  value: string;
}
export interface IPreferences {
  language1: string;
  language2: string;
  appId: string;
  appKey: string;
  isAutomaticQueryClipboard: boolean;
  isDisplayTargetTranslationLanguage: boolean;
}

export interface IListItemActionPanelItem {
  isInstalledEudic: Boolean;
  copyText?: string;
  queryText?: string;
  currentFromLanguage?: ILanguageListItem;
  currentTargetLanguage?: ILanguageListItem;
  onLanguageUpdate: (language: ILanguageListItem) => void;
}

export interface IReformatTranslateResult {
  title: string;
  value: string;
}

export interface ILanguageListItem {
  languageId: string;
  languageTitle: string;
  languageVoice: string[];
  googleLanguageId?: string;
}
