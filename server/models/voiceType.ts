interface PreDefinedVoiceType {
    voiceType: string;
    pitch: number;
}

interface preDefinedVoiceTypeDictionary {
    [key: string]: PreDefinedVoiceType;
}

export const preDefinedVoiceType: preDefinedVoiceTypeDictionary = {};
/* 
en-US-Wavenet-A, MALE
en-US-Wavenet-B, MALE
en-US-Wavenet-C, FEMALE
en-US-Wavenet-D, MALE
en-US-Wavenet-E, FEMALE
en-US-Wavenet-F, FEMALE
en-US-Wavenet-G, FEMALE
en-US-Wavenet-H, FEMALE
en-US-Wavenet-I, MALE
en-US-Wavenet-J, MALE
*/
preDefinedVoiceType["ImmigrationOfficer"] = {
    voiceType: "en-US-Standard-B",
    pitch: 1,
};
preDefinedVoiceType["Barista"] = {
    voiceType: "en-US-Standard-A",
    pitch: 1,
};
preDefinedVoiceType["MartCashier"] = {
    voiceType: "en-US-Standard-F",
    pitch: 1,
};
preDefinedVoiceType["Waitress"] = {
    voiceType: "en-US-Standard-F",
    pitch: 1,
};
preDefinedVoiceType["HotelReceptionist"] = {
    voiceType: "en-US-Standard-J",
    pitch: 1,
};
preDefinedVoiceType["TaxiDriver"] = {
    voiceType: "en-US-Standard-I",
    pitch: 1,
};
preDefinedVoiceType["Chef"] = {
    voiceType: "en-US-Standard-A",
    pitch: 1,
};
preDefinedVoiceType["Doctor"] = {
    voiceType: "en-US-Standard-J",
    pitch: 1,
};
preDefinedVoiceType["Nurse"] = {
    voiceType: "en-US-Standard-E",
    pitch: 1,
};
preDefinedVoiceType["ClothingShopStaff"] = {
    voiceType: "en-US-Standard-A",
    pitch: 1,
};
preDefinedVoiceType["Minsook"] = {
    voiceType: "en-US-Wavenet-C", // 후보 1
    pitch: 0.8,
};
preDefinedVoiceType["Doyoungboy"] = {
    voiceType: "en-US-Wavenet-D", // 후보 1
    pitch: 2.5,
};