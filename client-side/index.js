// hosted fields form
const form = document.querySelector("#my-sample-form");
// submit button
const submit = document.querySelector('input[type="submit"]');
// variables to get the amount
const calcTotalButton = document.querySelector("#amount-button");
let total = document.querySelector("#total-amount");
let amount;

calcTotalButton.addEventListener("click", function () {
  if (quantity.value < 10 || quantity.value > 690) {
    console.log("Error, invalid amount!");
  } else {
    amount = (quantity.value * 0.69).toFixed(2);
    total.innerHTML = `Total amount = $${amount}`;
  }
  return amount;
});

// get client token from server

const createClient = async () => {
  const response = await fetch("/client_token");
  const token = await response.json();
  createHostedFields(token);
  return;
};

// create client
const createHostedFields = (clientToken) => {
  braintree.client.create(
    {
      authorization: clientToken.braintreeclienttoken,
    },
    function (clientErr, clientInstance) {
      if (clientErr) {
        console.log(clientToken);
        console.error(clientErr);
        return;
      }

      braintree.hostedFields.create(
        {
          client: clientInstance,
          styles: {
            input: {
              "font-size": "14px",
            },
            "input.invalid": {
              color: "red",
            },
            "input.valid": {
              color: "green",
            },
          },
          fields: {
            number: {
              container: "#card-number",
              placeholder: "4111 1111 1111 1111",
            },
            cvv: {
              container: "#cvv",
              placeholder: "123",
            },
            expirationDate: {
              container: "#expiration-date",
              placeholder: "10/2024",
            },
          },
        },
        function (hostedFieldsErr, hostedFieldsInstance) {
          if (hostedFieldsErr) {
            console.error(hostedFieldsErr);
            return;
          }

          submit.removeAttribute("disabled");

          form.addEventListener(
            "submit",
            function (event) {
              event.preventDefault();

              hostedFieldsInstance.tokenize(function (tokenizeErr, payload) {
                if (tokenizeErr) {
                  console.error(tokenizeErr);
                  return;
                }

                // send the nonce to your server.
                createTransaction(payload, amount);

                hostedFieldsInstance.teardown(function (err) {
                  if (err) {
                    console.log(err);
                  }
                  // removes the hosted fields
                  form.remove();
                });
              });
            },
            false
          );
        }
      );
    }
  );
};

createClient();

//create transaction

const createTransaction = (payload, amount) => {
  const formData = {
    nonce: payload.nonce,
    amount: amount,
  };
  console.log(formData);
  fetch("/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
};
