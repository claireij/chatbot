interface ValidationResult {
    success: boolean;
    error?: string;
    message: string;
  }

export const inputfieldValidation = (message: string): ValidationResult | null => {
    const inputTests = {
      stringTest: {
        result: /^[a-zA-Z]+$/.test(message),
        failMessage:
          "Oh wow, seems like you're using letters in your calculation. I'm so sorry, but we're not that advanced in algebra. Maybe you just give me numbers, alright?",
      },
      onlyOperatorAndNumberTest: {
        result: /[^0-9^%+*/-\s]/g.test(message),
        failMessage: "Sorry this is not a calculation! Insert something like 1 + 1.",
      },
      numberTest: {
        result: /[0-9]+/.test(message),
      },
      operatorTest: {
        result: /[+%^*/-]+/.test(message),
      },
      whitespaceTest: {
        result: /^[\s]+$/.test(message),
      },
    };
  
    if (inputTests.stringTest.result) {
      return { success: false, error: "letters", message: inputTests.stringTest.failMessage };
    } else if (inputTests.onlyOperatorAndNumberTest.result) {
      return { success: false, error: "not_only_numbers_and_operators", message: inputTests.onlyOperatorAndNumberTest.failMessage };
    } else if (inputTests.whitespaceTest.result) {
      return { success: false, error: "just_whitespaces", message: "Ok, this is just whitespace... Maybe try again?" };
    }
    if (!inputTests.numberTest.result && inputTests.operatorTest.result) {
      return { success: false, error: "no_numbers", message: "Looks like you didn't use any numbers in there. Hard one to calculate... try again!" };
    } else if (inputTests.numberTest.result && !inputTests.operatorTest.result) {
      return { success: false, error: "no_operators", message: "Did you forget your operators? Try again!" };
    } else {
      const messageArray = message.split(" ");
      if (messageArray.length === 1) {
        return { success: false, error: "no_whitespaces", message: "Seems like you forgot to add some whitespaces between the numbers and the operator, try again!" };
      }
      if (!/^[0-9]+$/.test(messageArray[0]) || !/^[0-9]+$/.test(messageArray[messageArray.length - 1])) {
        return { success: false, error: "wrong_order", message: "Your calculation needs to begin and end with a number. Try again!" };
      }
  
      for (let i = 0; i < messageArray.length; i++) {
        if (i % 2 === 0 && !/^[0-9]+$/.test(messageArray[i])) {
          return { success: false, error: "other_problem", message: "There seems to be a problem with your calculation. Maybe you're missing a part or forgot spaces between numbers and operators." };
        } else if (i % 2 !== 0 && !/^[+\/*%\^\\-]+$/.test(messageArray[i])) {
          return { success: false, error: "other_problem", message: "There seems to be a problem with your calculation. Maybe you're missing a part or forgot spaces between numbers and operators." };
        }
      }
    }
    return null;
  };

export const calculate = (messageArray: (number | string)[]): number | null => {
    const operator = {
      add: "+",
      sub: "-",
      div: "/",
      mlt: "*",
      mod: "%",
      exp: "^",
      ooo: [
        [["*", "/", "%", "^"]],
        [["+", "-"]],
      ],
    };
  
    let output: number | null = null;
  
    for (let i = 0; i < operator.ooo.length; i++) {
      const re = new RegExp(`[${operator.ooo[i]}]`);
      const loopAndCalculate = (arr: (number | string)[]): (number | string)[] => {
        for (let j = 0; j < arr.length; j++) {
          if (re.test(String(arr[j]))) {
            output = _calculate(arr[j - 1] as number, arr[j] as string, arr[j + 1] as number);
            arr.splice(j - 1, 3, output);
          }
        }
        return arr;
      };
  
      let truncatedArray = loopAndCalculate(messageArray);
      while (truncatedArray.length > 1) {
        truncatedArray = loopAndCalculate(truncatedArray);
      }
    }
  
    function _calculate(a: number, op: string, b: number): number {
      switch (op) {
        case operator.add:
          return a + b;
        case operator.sub:
          return a - b;
        case operator.div:
          return a / b;
        case operator.mlt:
          return a * b;
        case operator.mod:
          return a % b;
        case operator.exp:
          return Math.pow(a, b);
        default:
          return 0;
      }
    }
    return output;
  };