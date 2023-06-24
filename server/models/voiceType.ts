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
    voiceType: "en-US-Standard-E",
};
preDefinedVoiceType["Barista"] = {
    voiceType: "en-US-Standard-A",
};
preDefinedVoiceType["MartCashier"] = {
    voiceType: "en-US-Standard-F",
};