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
  situation: "A first-time customer at the grocery store looking for specific items and discounts",
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

preDefinedRole["Restaurant"] = {
  role: ["Waiter", "Customer"],
  situation: "The customer is a food critic who is visiting this restaurant for the first time and is interested in tasting some of the best dishes the restaurant has to offer.",
  recommendations: [
    [
      "Try our Chef's Special.",
      "That's a rare Mediterranean herb.",
      "Glad you like the flavors.",
      "Sorry about the texture. I'll let the chef know.",
      "Thank you. We aim to please!"
    ],
    [
      "What are your signature dishes?",
      "Can you explain these unfamiliar ingredients?",
      "This flavor blend is amazing!",
      "This dish is too tough for me.",
      "Overall, great food and service.",
    ]
  ]
}

preDefinedRole["Cafe"] = {
  role: ["Barista", "Customer"],
  situation: "The customer is a tourist who is visiting the city for the first time and enters the Starbucks café to grab a coffee.",
  recommendations: [
    [
      "You should try our seasonal special!",
      "How about our signature Caramel Macchiato?",
      "I'm glad you enjoyed your coffee!",
      "Sorry, would you like us to adjust the sweetness?",
      "It was my pleasure, hope to see you again!"
    ],
    [
      "What's unique in your menu?",
      "I'm not sure what to pick, any suggestions?",
      "This coffee tastes great!",
      "This is too sweet for me.",
      "Thanks for the help, you've been great.",
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
