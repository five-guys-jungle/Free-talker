interface PreDefinedRole {
  // messages: { role: ChatCompletionRequestMessageRoleEnum; content: string }[];
  role: string[];
  situation: string;
  recommendations: string[][];
}

interface preDefinedRoleDictionary {
  [key: string]: PreDefinedRole;
}

export const preDefinedRole: preDefinedRoleDictionary = {};

preDefinedRole["Mart"] = {
  role: ["Cashier", "Customer"],
  situation: "a first-time customer at the grocery store looking for specific items and discounts",
  recommendations: [
    [
      "Hello, how can I assist you today?",
      "Our organic produce section is right at the back of the store, next to the dairy products",
      "Yes, indeed! All our dairy products are 15% off this week. Don't forget to grab your favorites",
      "Found everything you were looking for?",
      "Your total is $56.78. Do you have our loyalty card for an extra discount?",
    ],
    [
      "I'm looking for some organic produce. Can you point me in the right direction?",
      "Great, thank you. I also heard there's a discount on dairy products this week. Is that still on?",
      "That's wonderful! I'll definitely check that out.",
      "Yes, thanks to your help. How much is my total?",
      "I don't, but I'd like to sign up for one."
    ]
  ]
}


// preDefinedRole["chairCafe"] = {
//   role: ["Barista", "Customer"],
//   recommendations: []
// }

// preDefinedRole["chairRestaurant"] = {
//   role: ["Waiter", "Customer"],
//   recommendations: []
// }
