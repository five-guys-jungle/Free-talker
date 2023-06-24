interface PreDefinedVoiceType {
    voiceType: string;
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
};
preDefinedVoiceType["Barista"] = {
    voiceType: "en-US-Standard-A",
};
preDefinedVoiceType["MartCashier"] = {
    voiceType: "en-US-Standard-F",
};
preDefinedVoiceType["Waitress"] = {
    voiceType: "en-US-Standard-F",
};
preDefinedVoiceType["HotelReceptionist"] = {
    voiceType: "en-US-Standard-J",
};
preDefinedVoiceType["TaxiDriver"] = {
    voiceType: "en-US-Standard-I",
};
preDefinedVoiceType["Chef"] = {
    voiceType: "en-US-Standard-A",
};
preDefinedVoiceType["Doctor"] = {
    voiceType: "en-US-Standard-J",
};
preDefinedVoiceType["Nurse"] = {
    voiceType: "en-US-Standard-E",
};
preDefinedVoiceType["ClothingShopStaff"] = {
    voiceType: "en-US-Standard-A",
};
