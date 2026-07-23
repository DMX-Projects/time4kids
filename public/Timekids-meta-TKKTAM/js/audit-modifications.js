(function () {
    function initInvestmentChips() {
        var $form = $('#timekidsEnquiryForm');
        if (!$form.length) return;

        var $hidden = $form.find('#tk-investment-range');
        $form.on('click', '.tk-chip', function () {
            var $chip = $(this);
            $form.find('.tk-chip').removeClass('is-active');
            $chip.addClass('is-active');
            $hidden.val($chip.data('value') || '');
            if ($form.data('validator')) {
                $form.validate().element($hidden[0]);
            }
        });
    }

    $(document).ready(function () {
        initInvestmentChips();
    });
})();
