$(document).ready(function () {
    var $form = $('#timekidsEnquiryForm');
    if (!$form.length) return;

    var campaignSource = $form.data('source') || 'lp_wb';
    var pageType = $form.data('page-type') || campaignSource;
    var campaignName = $form.data('campaign') || campaignSource;
    var campaignComments = $form.data('comments') || 'West Bengal LP campaign form';
    var geoMode = $form.data('geo-mode') || 'state-city';
    var defaultState = $form.data('default-state') || '';
    var isWbCitiesOnly = geoMode === 'wb-cities';

    function getUrlUtmParams() {
        var params = {};
        try {
            var search = new URLSearchParams(window.location.search || '');
            ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) {
                var value = $.trim(search.get(key) || '');
                if (value) params[key] = value;
            });
        } catch (e) {}
        return params;
    }

    var $submitBtn = $('#form-submit-button');
    var $error = $('#form-error');
    var $success = $('#form-success-message');
    var $name = $form.find('[name="name"]');
    var $phone = $form.find('[name="phone"]');
    var $email = $form.find('[name="email"]');
    var $state = $form.find('[name="state"]');
    var $citySelect = $form.find('select.cityDropDown');
    var $cityInput = $form.find('input.cityInput');
    var $otp = $form.find('[name="otp"]');
    var $otpRow = $form.find('.tk-otp-row');
    var $sendOtpBtn = $('#tk-send-otp');
    var $otpStatus = $('#tk-otp-status');
    var otpSending = false;
    var otpSentForPhone = '';

    function getCityValue() {
        if ($citySelect.is(':visible') && !$citySelect.prop('disabled')) {
            return $.trim($citySelect.val() || '');
        }
        if ($cityInput.is(':visible') && !$cityInput.prop('disabled')) {
            return $.trim($cityInput.val() || '');
        }
        return $.trim($form.find('[name="city"]').val() || '');
    }

    function getStateValue() {
        if (isWbCitiesOnly) {
            return defaultState || 'West Bengal';
        }
        return $.trim($state.filter('select, input').val() || '');
    }

    function clearFieldError(fieldName) {
        if (!$form.data('validator')) return;
        var validator = $form.validate();
        var $el = $form.find('[name="' + fieldName + '"]').filter(':enabled').first();
        if ($el.length) {
            validator.successList.push($el[0]);
            validator.showErrors();
            $el.removeClass('error');
            validator.errorsFor($el[0]).hide();
            delete validator.invalid[fieldName];
            delete validator.submitted[fieldName];
        }
    }

    function setCityLoading() {
        $citySelect.empty().append('<option value="">Loading cities...</option>').show().prop('disabled', true);
        $cityInput.hide().prop('disabled', true).removeAttr('name').val('');
        $citySelect.attr('name', 'city');
    }

    function showCitySelect(cities) {
        $citySelect.empty().append('<option value="">Select city</option>');
        (cities || []).forEach(function (city) {
            var name = typeof city === 'string' ? city : city.name;
            if (name) {
                $citySelect.append($('<option></option>').attr('value', name).text(name));
            }
        });
        $citySelect.attr('name', 'city').show().prop('disabled', false);
        $cityInput.removeAttr('name').hide().prop('disabled', true).val('');
        clearFieldError('city');
    }

    function showCityTextInput(hasState) {
        $citySelect.removeAttr('name').hide().prop('disabled', true).empty();
        $cityInput.attr('name', 'city').show().prop('disabled', !hasState).val('');
        $cityInput.attr('placeholder', hasState ? 'Enter your city *' : 'Select a state first');
        clearFieldError('city');
    }

    function loadStates() {
        if (isWbCitiesOnly) {
            loadCitiesForState(defaultState || 'West Bengal');
            return;
        }

        $state.prop('disabled', true);
        $state.find('option:not(:first)').remove();
        $state.find('option:first').text('Loading states...');

        $.ajax({
            type: 'GET',
            url: '/api/common/states/?scope=franchise-lp',
            success: function (response) {
                var results = (response && response.results) || response || [];
                $state.find('option:first').text('Select state');
                results.forEach(function (item) {
                    var name = typeof item === 'string' ? item : item.name;
                    if (name) {
                        $state.append($('<option></option>').attr('value', name).text(name));
                    }
                });
                $state.prop('disabled', false);
            },
            error: function () {
                $state.find('option:first').text('Failed to load states');
                $state.prop('disabled', false);
                $error.text('Could not load states. Please refresh and try again.');
            }
        });
    }

    function loadCitiesForState(stateName) {
        if (!stateName) {
            showCityTextInput(false);
            return;
        }

        setCityLoading();
        $.ajax({
            type: 'GET',
            url: '/api/common/cities/',
            data: { state: stateName, scope: isWbCitiesOnly ? undefined : 'franchise-lp' },
            success: function (response) {
                var results = (response && response.results) || response || [];
                if (results.length) {
                    showCitySelect(results);
                } else {
                    showCityTextInput(true);
                }
            },
            error: function () {
                showCityTextInput(true);
            }
        });
    }

    function recheckField($el) {
        var validator = $form.data('validator');
        if (!validator || !$el || !$el.length) return;
        var name = $el.attr('name');
        if (name && (name in validator.submitted || name in validator.invalid)) {
            validator.element($el[0]);
        }
    }

    function normalizePhone(raw) {
        var digits = String(raw || '').replace(/\D/g, '');
        if (digits.length === 12 && digits.indexOf('91') === 0) {
            digits = digits.slice(2);
        } else if (digits.length === 11 && digits.charAt(0) === '0') {
            digits = digits.slice(1);
        }
        return digits.slice(0, 10);
    }

    function hideOtpRow() {
        $otpRow.hide().removeClass('is-visible');
        $otp.val('');
    }

    function showOtpRow() {
        $otpRow.show().addClass('is-visible');
        if (typeof queueBannerSync === 'function') {
            queueBannerSync();
        }
    }

    function updateSendOtpVisibility() {
        var phone = normalizePhone($phone.val());
        if (/^[6-9]\d{9}$/.test(phone)) {
            $sendOtpBtn.prop('disabled', false);
        } else {
            $sendOtpBtn.prop('disabled', true);
        }
        if (otpSentForPhone && otpSentForPhone !== phone) {
            otpSentForPhone = '';
            hideOtpRow();
            $otpStatus.text('').removeClass('is-ok is-err');
        }
    }

    function sendOtp() {
        var phone = normalizePhone($phone.val());
        if (!/^[6-9]\d{9}$/.test(phone)) {
            $otpStatus.text('Enter a valid 10-digit mobile number first.').removeClass('is-ok').addClass('is-err');
            return;
        }
        if (otpSending) return;

        otpSending = true;
        $sendOtpBtn.prop('disabled', true).text('Sending...');
        $otpStatus.text('').removeClass('is-ok is-err');

        $.ajax({
            type: 'POST',
            url: '/api/enquiries/send-otp/',
            contentType: 'application/json',
            data: JSON.stringify({ phone: phone }),
            success: function (res) {
                if (res && res.success === false) {
                    $otpStatus.text(res.detail || res.error || 'Failed to send OTP. Please try again.')
                        .removeClass('is-ok').addClass('is-err');
                    $sendOtpBtn.text('Generate OTP');
                    return;
                }
                otpSentForPhone = phone;
                showOtpRow();
                $otp.focus();
                var masked = '+91 ******' + phone.slice(-4);
                var msg = (res && res.detail) || ('OTP sent to ' + masked + '.');
                $otpStatus.text(msg).removeClass('is-err').addClass('is-ok');
                $sendOtpBtn.text('Resend OTP');
            },
            error: function (xhr) {
                var msg = 'Failed to send OTP. Please try again.';
                try {
                    var res = xhr.responseJSON || JSON.parse(xhr.responseText || '');
                    msg = res.detail || res.error || msg;
                } catch (e) {}
                $otpStatus.text(msg).removeClass('is-ok').addClass('is-err');
                $sendOtpBtn.text('Generate OTP');
            },
            complete: function () {
                otpSending = false;
                updateSendOtpVisibility();
            }
        });
    }

    if (!isWbCitiesOnly) {
        $state.on('change', function () {
            loadCitiesForState($state.val());
            recheckField($state);
        });
    }

    $citySelect.on('change', function () {
        recheckField($citySelect);
    });

    $cityInput.on('input', function () {
        recheckField($cityInput);
    });

    if (!isWbCitiesOnly) {
        showCityTextInput(false);
    }
    loadStates();
    hideOtpRow();
    updateSendOtpVisibility();

    $name.on('input', function () {
        this.value = this.value.replace(/[^a-zA-Z\s.'-]/g, '').replace(/\s{2,}/g, ' ').slice(0, 75);
        recheckField($name);
    });

    $phone.on('input', function () {
        this.value = normalizePhone(this.value);
        updateSendOtpVisibility();
        recheckField($phone);
    });

    $email.on('input', function () {
        this.value = this.value.replace(/\s/g, '').slice(0, 100);
        recheckField($email);
    });

    $otp.on('input', function () {
        this.value = String(this.value || '').replace(/\D/g, '').slice(0, 4);
        recheckField($otp);
    });

    $sendOtpBtn.on('click', function (e) {
        e.preventDefault();
        sendOtp();
    });

    var $ack = $form.find('[name="acknowledge"]');
    $ack.prop('checked', true);
    $ack.on('click change', function () {
        $ack.prop('checked', true);
        recheckField($ack);
    });

    $.validator.addMethod('validName', function (value) {
        var name = String(value || '').trim();
        if (name.length < 3 || name.length > 75) return false;
        return /^[A-Za-z][A-Za-z\s.'-]*[A-Za-z]$|^[A-Za-z]{3,}$/.test(name);
    }, 'Please enter a valid full name (letters only, min 3 characters)');

    $.validator.addMethod('strictEmail', function (value) {
        var email = String(value || '').trim();
        if (!email) return false;
        return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
            && email.indexOf('..') === -1
            && email.indexOf('.') !== 0
            && email.lastIndexOf('.') !== email.length - 1
            && email.split('@').length === 2;
    }, 'Please enter a valid email address');

    $.validator.addMethod('phoneIndia', function (value) {
        return /^[6-9]\d{9}$/.test(normalizePhone(value));
    }, 'Please enter a valid 10-digit Indian mobile number');

    $.validator.addMethod('cityRequired', function () {
        return !!getCityValue();
    }, 'Please select or enter your city');

    $.validator.addMethod('otpRequired', function (value) {
        return /^\d{4}$/.test(String(value || '').trim());
    }, 'Please enter the 4-digit OTP');

    var validationRules = {
        name: { required: true, validName: true },
        email: { required: true, strictEmail: true },
        phone: { required: true, phoneIndia: true, minlength: 10, maxlength: 10 },
        city: { cityRequired: true },
        otp: { otpRequired: true },
        acknowledge: { required: true }
    };
    var validationMessages = {
        name: {
            required: 'Please enter your full name',
            validName: 'Please enter a valid full name (letters only, min 3 characters)'
        },
        email: {
            required: 'Please enter your email address',
            strictEmail: 'Please enter a valid email address (e.g. name@example.com)'
        },
        phone: {
            required: 'Please enter your mobile number',
            phoneIndia: 'Please enter a valid 10-digit Indian mobile number (starts with 6-9)',
            minlength: 'Mobile number must be exactly 10 digits',
            maxlength: 'Mobile number must be exactly 10 digits'
        },
        city: 'Please select or enter your city',
        otp: { otpRequired: 'Please enter the 4-digit OTP sent to your mobile' },
        acknowledge: 'Please acknowledge the terms to proceed'
    };

    if (!isWbCitiesOnly) {
        validationRules.state = { required: true };
        validationMessages.state = 'Please select your state';
    }

    $form.validate({
        ignore: ':hidden:not(select.cityDropDown):not(.tk-otp-row input)',
        onkeyup: function (element) {
            if (element.name in this.submitted || element.name in this.invalid) {
                this.element(element);
            }
        },
        onfocusout: function (element) {
            if (element.name in this.submitted || element.name in this.invalid) {
                this.element(element);
            }
        },
        onclick: function (element) {
            if (element.name in this.submitted || element.name in this.invalid) {
                this.element(element);
            }
        },
        rules: validationRules,
        messages: validationMessages,
        errorPlacement: function (error, element) {
            if (element.attr('name') === 'acknowledge') {
                error.appendTo(element.closest('.tk-form-terms'));
            } else if (element.hasClass('cityDropDown') || element.hasClass('cityInput')) {
                error.appendTo(element.closest('.form_field'));
            } else if (element.attr('name') === 'otp' || element.attr('name') === 'phone') {
                error.appendTo(element.closest('.form_field'));
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function () {
            var phone = normalizePhone($phone.val());
            var otp = $.trim($otp.val());
            var cityValue = getCityValue();
            var stateValue = getStateValue();

            if (!cityValue) {
                $error.text('Please select or enter your city');
                return;
            }

            if (!otpSentForPhone || otpSentForPhone !== phone) {
                $error.text('Please click Generate OTP and enter the code sent to your mobile.');
                return;
            }
            if (!$otpRow.is(':visible')) {
                showOtpRow();
            }

            var utm = getUrlUtmParams();
            // Hidden fields: name="source" (ad channel), name="type" (campaign).
            // CRM form key stays in data-source (july_meta / july_lp / lp_wb) for filters.
            var hiddenSource = $.trim($form.find('input[name="source"]').val() || '');
            var hiddenType = $.trim($form.find('input[name="type"]').val() || '');
            var resolvedSource = utm.utm_source || hiddenSource || pageType;
            var resolvedCampaign = utm.utm_campaign || hiddenType || campaignName;
            var payload = {
                fullName: $.trim($name.val()),
                email: $.trim($email.val()).toLowerCase(),
                mobile: phone,
                otp: otp,
                state: stateValue,
                city: cityValue,
                preferredCentreLocation: cityValue,
                // All 3 campaign LPs acknowledge ₹10–15L only (no capacity picker).
                investmentRange: '₹10–15L',
                source: campaignSource,
                comments: campaignComments,
                landingPageUrl: window.location.href.split('#')[0],
                utmSource: resolvedSource,
                utmMedium: utm.utm_medium || '',
                utmCampaign: resolvedCampaign,
                pageType: resolvedSource,
                campaign: resolvedCampaign
            };

            $submitBtn.prop('disabled', true).val('Submitting...');
            $error.text('');

            $.ajax({
                type: 'POST',
                url: '/api/enquiries/crm-leads/',
                contentType: 'application/json',
                data: JSON.stringify(payload),
                success: function (res) {
                    // Conversions fire on thank-you.html (PageView + Lead / Ads).
                    window.location.href = 'thank-you.html';
                },
                error: function (xhr) {
                    var msg = 'Something went wrong. Please try again.';
                    if (xhr.responseJSON && xhr.responseJSON.error) {
                        msg = xhr.responseJSON.error;
                    } else if (xhr.responseJSON && xhr.responseJSON.detail) {
                        msg = xhr.responseJSON.detail;
                    }
                    $error.text(msg);
                    $submitBtn.prop('disabled', false).val('Submit');
                }
            });
        }
    });

    function syncBannerHeights() {
        var $card = $('#banner .form_hld.tk-enquiry-card');
        var $chalk = $('#banner .chalk_box');
        var $right = $('#banner .banner_right');
        if (!$card.length || !$chalk.length) return;

        if (window.matchMedia('(max-width: 1023px)').matches) {
            $card.css({ height: '', minHeight: '' });
            $chalk.css({ height: '', minHeight: '' });
            $right.css({ minHeight: '' });
            return;
        }

        $card.css({ height: '', minHeight: '' });
        $chalk.css({ height: '', minHeight: '' });
        $right.css({ minHeight: '' });

        var formH = $card.outerHeight() || 0;
        var rightH = $right.outerHeight() || 0;
        var target = Math.max(formH, rightH);
        if (target < 1) return;

        $card.css({ minHeight: target + 'px', height: target + 'px' });
        $chalk.css({ height: target + 'px', minHeight: target + 'px' });
        $right.css({ minHeight: target + 'px' });
    }

    var syncTimer = null;
    function queueBannerSync() {
        window.clearTimeout(syncTimer);
        syncTimer = window.setTimeout(syncBannerHeights, 50);
    }

    syncBannerHeights();
    $(window).on('load resize', queueBannerSync);
    $('#banner .chalk_box img').on('load', queueBannerSync);
    $otpRow.on('transitionend', queueBannerSync);
    $sendOtpBtn.on('click', function () {
        window.setTimeout(queueBannerSync, 100);
    });
});
