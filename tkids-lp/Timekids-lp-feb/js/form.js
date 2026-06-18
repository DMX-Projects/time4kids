$(document).ready(function () {
   var formURL = 'https://globalapi.zeelearn.com/Kidzeewebapi/V1/KidzeeEnquiry';
   var smsURL = 'https://globalapi.zeelearn.com/Kidzeewebapi/V1/SendSms_Clientbcbc';
  /*  if(location.hostname.indexOf('kidzee')>=0){
      smsURL = '/WebRoute/SendSms_Clientbcbc';
      formURL = '/WebRoute/KidzeeEnquiry';
   } */
   var submitInterval;
   var statesArray;
   var cityArray;
   var randomSMS = '';
   function commonForKeypressAndChange(props) {
      let input = props.input;
      let strForBind = props.strForBind;
      //-------------------
      if (input.data()[strForBind + '_onKeypress']) {
         input.unbind("keypress", input.data()[strForBind + '_onKeypress']);
      }
      input.data()[strForBind + '_onKeypress'] = (e) => {
         if (props.onKeypress && typeof props.onKeypress == 'function') {
            props.onKeypress(e);
         }
      };
      input.bind("keypress", input.data()[strForBind + '_onKeypress']);
      //---------------
      if (input.data()[strForBind + '_onChange']) {
         input.unbind("input chnage", input.data()[strForBind + '_onChange']);
      }
      input.data()[strForBind + '_onChange'] = (e) => {
         if (props.onChange && typeof props.onKeypress == 'function') {
            props.onChange(e);
         }
      };
      input.bind("input chnage", input.data()[strForBind + '_onChange']);
   }
   function checkMaxLength(input) {
      var maxlength = input.attr("maxlength");
      if (maxlength != undefined && input.val().length > maxlength) {
         input.val(input.val().substring(0, maxlength));
      };
   }
   function bindRestrict_MaxLength(inputArray) {
      inputArray.forEach((inputInArray) => {
         inputInArray.each((i, ele) => {
            var input = $(ele);
            commonForKeypressAndChange({
               input: input,
               strForBind: 'bindRestrict_MaxLength',
               onKeypress: (e) => {
                  checkMaxLength(input);
               },
               onChange: (e) => {
                  checkMaxLength(input);
               }
            });
         });
      });
   }
   bindRestrict_MaxLength([
      $('#kidzeeForm [name="name"]'),
      $('#kidzeeForm [name="mobile"]'),
      $('#kidzeeForm [name="pincode"]'),
      $('#kidzeeForm [name="otp"]'),
   ])
   $.validator.methods.email = function (value, element) {
      return this.optional(element) || /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value);
   }
   $.validator.addMethod("noBlank", function (value, element) {
      if (value.length > 0 && value.trim().length == 0) {
         return false;
      }
      return true;
   }, "Don't leave it empty");

   $.validator.addMethod("mobileVerifyIndia", function (value, element, param) {
      return verifyMobileLength();
   }, "Please enter 10 digit mobile number");
   function verifyMobileLength() {
      mobileVerifyBtn.html(OTPButtonLastHTML);
      if ($('#kidzeeForm [name="mobile"]').val().length == 10) {
         mobileVerifyBtn.fadeIn();
         return true;
      } else {
         mobileVerifyBtn.fadeOut();
         return false;
      }
   }
   commonForKeypressAndChange({
      input: $('#kidzeeForm [name="mobile"]'),
      strForBind: 'mobile_onChange_verify',
      onKeypress: (e) => {
         verifyMobileLength();
         return true;
      },
      onChange: (e) => {
         verifyMobileLength();
      }
   })

   $.validator.addMethod("otpVerify", function (value, element, param) {
      if (value.length == 4) {
         if (value == randomSMS) {
            return true;
         } else {
            return false;
         }

      } else {
         return false;
      }
   }, "Invalid OTP number");

   $.validator.addMethod("pincode", function (value, element, param) {
      if (value.length == 6) {
         return true;
      } else {
         return false;
      }
   }, "Please enter 6 digit pincode number");

   function bindRestrict_AlphabetOnly(inputArray) {
      inputArray.forEach((inputInArray) => {
         inputInArray.each((i, ele) => {
            let input = $(ele);
            commonForKeypressAndChange({
               input: input,
               strForBind: 'bindRestrict_AlphabetOnly',
               onKeypress: (e) => {
                  return /[a-z A-Z]/g.test(e.key);
               },
               onChange: (e) => {
                  input.val(input.val().replace(/[^a-zA-Z ]/g, ''));
               }
            })
         });
      });
   }

   function bindRestrict_TextArea(inputArray) {
      inputArray.forEach((inputInArray) => {
         inputInArray.each((i, ele) => {
            let input = $(ele);
            commonForKeypressAndChange({
               input: input,
               strForBind: 'bindRestrict_TextArea',
               onKeypress: (e) => {
                  return /[a-zA-Z0-9 &()+,-./:;?]/g.test(e.key);
               },
               onChange: (e) => {
                  input.val(input.val().replace(/[^a-zA-Z0-9 &()+,-./:;?]/g, ''));
               }
            })
         });
      });

   }

   function bindRestrict_AlphabetNumberOnly(inputArray) {
      inputArray.forEach((inputInArray) => {
         inputInArray.each((i, ele) => {
            let input = $(ele);
            this.commonForKeypressAndChange({
               input: input,
               strForBind: 'bindRestrict_AlphabetNumberOnly',
               onKeypress: (e) => {
                  return /[a-z A-Z0-9]/g.test(e.key);
               },
               onChange: (e) => {
                  input.val(input.val().replace(/[^a-z A-Z0-9]/g, ''));
               }
            })
         });
      });
      inputArray.forEach((input) => {

      });
   }

   function bindRestrict_NumberOnly(inputArray) {
      inputArray.forEach((inputInArray) => {
         inputInArray.each((i, ele) => {
            let input = $(ele);
            commonForKeypressAndChange({
               input: input,
               strForBind: 'bindRestrict_NumberOnly',
               onKeypress: (e) => {
                  return /[0-9]/g.test(e.key);
               },
               onChange: (e) => {
                  input.val(input.val().replace(/[^0-9]/g, ''));
               }
            })
         });
      });
   }

   function bindRestrict_CompanyName(inputArray) {
      inputArray.forEach((inputInArray) => {
         inputInArray.each((i, ele) => {
            let input = $(ele);
            commonForKeypressAndChange({
               input: input,
               strForBind: 'bindRestrict_CompanyName',
               onKeypress: (e) => {
                  return /[a-zA-Z0-9 ,.-]/g.test(e.key);
               },
               onChange: (e) => {
                  input.val(input.val().replace(/[^a-zA-Z0-9 ,.-]/g, ''));
               }
            })
         });
      });
   }
   bindRestrict_AlphabetOnly([
      $('#kidzeeForm [name="name"]')
   ]);
   bindRestrict_NumberOnly([
      $('#kidzeeForm [name="mobile"]'),
      $('#kidzeeForm [name="pincode"]'),
   ]);

   function selectOnChangeAndValid(props) {
      let input = $(props.str);
      if (input.data().customEventFun) {
         input.unbind('change select', input.data().customEventFun);
      }
      input.data().customEventFun = (e) => {
         if (input.valid) {
            input.valid();
         }
         if (typeof props.onChange == 'function') {
            props.onChange(e);
         }
      }
      input.bind('change select', input.data().customEventFun);

   }



   selectOnChangeAndValid({
      str: ('.stateDropDown'),
      onChange: (e) => {
         $('.cityDropDown').empty();
         $('.cityDropDown').append('<option value="" data-stateIndex="">City *</option>');
         var stateIndex = $(e.target).find(':selected').data().stateindex;
         if (stateIndex === '') {
            return;
         }
         cityArray = statesArray[stateIndex].City;
         for (var index = 0; index < cityArray.length; index++) {
            var element = cityArray[index];
            $('.cityDropDown').append('<option value="' + element.City_Name + '" data-stateIndex="' + (index) + '">' + element.City_Name + '</option>');
         }
         $('.cityDropDown').valid();
      }
   })
   selectOnChangeAndValid({
      str: ('.cityDropDown'),
      onChange: (e) => {
      }
   })
   function getRandomNumber() {
      return Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
   }
   var isOTPSending = false;
   var mobileVerifyBtn = $('.mobileVerifyBtn');
   var OTPButtonLastHTML = mobileVerifyBtn.html();
   mobileVerifyBtn.css({ cursor: 'pointer' });
   mobileVerifyBtn.bind('click', function () {
      if (isOTPSending == true) {
         return;
      }
      console.log('Sending ...');
      isOTPSending = true;
      var mobile = $('#kidzeeForm [name="mobile"]').val();
      mobileVerifyBtn.html('Sending ...');
      mobileVerifyBtn.css({ cursor: 'default' });
      randomSMS = getRandomNumber();
      //console.log(randomSMS);
      jQuery.ajax({
         type: "POST",
         data: {
            MobileNo: mobile,
            smstext: "Your Kidzee Verification code is : " + randomSMS,
            sResponse: ""
         },
         crossDomain: false,
         url: smsURL,
         success: function (response) {
            mobileVerifyBtn.html('OTP Sent');
            var opacity = 0;
            var count = 0;
            var tempId = setInterval(() => {
               count++;
               mobileVerifyBtn.css({ opacity: opacity })
               opacity = opacity == 0 ? 100 : 0;
               if (count > 7) {
                  clearInterval(tempId);
                  setTimeout(() => {
                     isOTPSending = false;
                     mobileVerifyBtn.html('Resend OTP');
                     mobileVerifyBtn.css({ cursor: 'pointer' });
                  }, 3000);
               }
            }, 200);

         }

      });
   });

   $("#kidzeeForm").validate({

      rules: {
         name: {
            required: true,
            noBlank: true
         },
         email: {
            required: true,
            email: true
         },

         mobile: {
            required: true,
            noBlank: true,
            mobileVerifyIndia: {
               param: true
            }
         },
         otp: {
            required: {
               param: true,
               depends: (e) => {
                  return ($('#kidzeeForm [name="mobile"]').val().length == 10);
               }
            },
            minlength: 4,
            otpVerify: {
               param: true,
               depends: (e) => {
                  return ($('#kidzeeForm [name="mobile"]').val().length == 10);
               }
            }
         },
         pincode: {
            required: true,
            noBlank: true,
            pincode: true,
         },
         stateDropDown: {
            required: true,
         },
         cityDropDown: {
            required: {
               param: true,
               depends: (e) => {
                  console.log()
                  return ($('.stateDropDown').find(':selected').data().stateindex !== '');
               }
            },
         },
         checkIAgree:{
            required: true,
         }
      },
      messages: {
         name: "Please enter your name",
         email: {
            required: "Please enter a email"

         },
         mobile: {
            required: "Please enter a mobile no.",
         },
         otp: {
            required: "Please enter a OTP no.",
            minlength: "Minimum length would be 4"
         },
         pincode: {
            required: "Please enter a pincode",
            maxlength: "Max length would be 14"
         },
         stateDropDown: {
            required: "Please select state",
         },
         cityDropDown: {
            required: "Please select city",
         },
         checkIAgree:{
            required:'Please select a checkbox before proceeding.'
         }

      },
      submitHandler: (form) => {
         var pp = 0;
         $('#form-submit-button').prop('disabled', true);
         $('#form-submit-button').val('Processing      ');
         clearInterval(submitInterval);
         submitInterval = setInterval(function () {
            if (pp == 0) {
               $('#form-submit-button').val('Processing      ');
            } else if (pp == 1) {
               $('#form-submit-button').val('Processing .    ');
            } else if (pp == 2) {
               $('#form-submit-button').val('Processing . .  ');
            } else if (pp == 3) {
               $('#form-submit-button').val('Processing . . .');
            }
            pp++;
            if (pp == 4) {
               pp = 0;
            }
         }, 300);
         $('#error').html('');
         var name = $('#kidzeeForm [name="name"]').val();
         var email = $('#kidzeeForm [name="email"]').val();
         var mobile = $('#kidzeeForm [name="mobile"]').val();
         var pincode = $('#kidzeeForm [name="pincode"]').val();
         var stateDropDown = $('#kidzeeForm [name="stateDropDown"]').val();
         var cityDropDown = $('#kidzeeForm [name="cityDropDown"]').val();
         var urlParams = new URLSearchParams(location.search)

         var utm_source = urlParams.get('utm_source');//"Website"
         utm_source = utm_source == null ? 'Website' : utm_source;

         var utm_medium = urlParams.get('utm_medium'); //"Print-Advertisement"
         utm_medium = utm_medium == null ? '' : utm_medium;

         var utm_compaign = urlParams.get('utm_campaign');
         utm_compaign = utm_compaign == null ? '' : utm_compaign;

         var gclid = urlParams.get('gclid');
         gclid = gclid == null ? '' : gclid;



         var utm_content = urlParams.get('utm_content'); //"Print-Advertisement"
         utm_content = utm_content == null ? '' : utm_content;

         var utm_term = urlParams.get('utm_term'); //"Print-Advertisement"
         utm_term = utm_term == null ? '' : utm_term;

         var formData = {
            "City": cityDropDown,
            "Country": "India",
            "Email": email,
            "FirstName": name,
            "HaveSpace": "",
            "LastName": ".",
            "Location": "",
            "Mobile": mobile,
            "PinCode": pincode,
            "Product": "259262000001186013",
            "ProjectId": "1",
            "SoonStartsIn": "",
            "Source": gclid,
            "gclid": gclid,
            "State": stateDropDown,
            "Type": "F",
            "WillingToInvest": "",
            "utm_compaign": utm_compaign,
            "utm_medium": utm_medium,
            "utm_source": utm_source,
            "utm_content": utm_content,
            "utm_term": utm_term
         }

         //console.log(formData);

         jQuery.ajax({
            type: "POST",
            data: formData,
            url: formURL,
            success: function (response) {
               console.log('response', response);
               console.log(response[0].Id)
               if (response[0].Id != undefined) {
                  location.href = "thank-you.html";
               }
            }
         });

      }
   });
   //----------------------------------------------------------------
   //----------------------------------------------------------------
   jQuery.ajax({
      type: "GET",
      url: 'json/GetFranchiseeDetailsCity.json',
      success: function (response) {
         statesArray = response.root.subroot[0].State;
         for (var index = 0; index < statesArray.length; index++) {
            var element = statesArray[index];
            $('.stateDropDown').append('<option value="' + element.State_Name + '" data-stateIndex="' + (index) + '">' + element.State_Name + '</option>');
         }

      }

   });
})