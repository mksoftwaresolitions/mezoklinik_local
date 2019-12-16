/*global $, document, Chart, LINECHART, data, options, window*/
$(document).ready(function () {

    'use strict';

    // Main Template Color
    var brandPrimary = '#33b35a';

    // ------------------------------------------------------- //
    // Custom Scrollbar
    // ------------------------------------------------------ //

    if ($(window).outerWidth() > 992) {
         $(window).on("load",function(){
            $("nav.side-navbar").mCustomScrollbar({
                scrollInertia: 200
            });
        });
    }


    // ------------------------------------------------------- //
    // Side Navbar Functionality
    // ------------------------------------------------------ //
    $('#toggle-btn').on('click', function (e) {

        e.preventDefault();

        if ($(window).outerWidth() > 1194) {
            $('nav.side-navbar').toggleClass('shrink');
            $('.page').toggleClass('active');
        } else {
            $('nav.side-navbar').toggleClass('show-sm');
            $('.page').toggleClass('active-sm');
        }
    });


    // ------------------------------------------------------- //
    // Login  form validation
    // ------------------------------------------------------ //
    $('#login-form').validate({
        messages: {
            loginUsername: 'Lütfen kullanıcı adınızı giriniz',
            loginPassword: 'Lütfen şifrenizi giriniz'
        }
    });

    // ------------------------------------------------------- //
    // Register form validation
    // ------------------------------------------------------ //
    $('#register-form').validate({
        messages: {
            registerUsername: 'Lütfen kullanıcı adınızı giriniz',
            registerEmail: 'Lütfen geçerli bir mail adresi giriniz',
            registerPassword: 'Lütfen şifrenizi giriniz'
        }
    });

    // ------------------------------------------------------- //
    // Material Inputs
    // ------------------------------------------------------ //

    var materialInputs = $('input.input-material');

    // activate labels for prefilled values
    materialInputs.filter(function() { return $(this).val() !== ""; }).siblings('.label-material').addClass('active');

    // move label on focus
    materialInputs.on('focus', function () {
        $(this).siblings('.label-material').addClass('active');
    });

    // remove/keep label on blur
    materialInputs.on('blur', function () {
        $(this).siblings('.label-material').removeClass('active');

        if ($(this).val() !== '') {
            $(this).siblings('.label-material').addClass('active');
        } else {
            $(this).siblings('.label-material').removeClass('active');
        }
    });

    // ------------------------------------------------------- //
    // Jquery Progress Circle
    // ------------------------------------------------------ //
    var progress_circle = $("#progress-circle").gmpc({
        color: brandPrimary,
        line_width: 5,
        percent: 80
    });
    progress_circle.gmpc('animate', 80, 3000);

    // ------------------------------------------------------- //
    // External links to new window
    // ------------------------------------------------------ //

    $('.external').on('click', function (e) {

        e.preventDefault();
        window.open($(this).attr("href"));
    });

    // ------------------------------------------------------ //
    // For demo purposes, can be deleted
    // ------------------------------------------------------ //

    var stylesheet = $('link#theme-stylesheet');
    $( "<link id='new-stylesheet' rel='stylesheet'>" ).insertAfter(stylesheet);
    var alternateColour = $('link#new-stylesheet');

    if ($.cookie("theme_csspath")) {
        alternateColour.attr("href", $.cookie("theme_csspath"));
    }

    $("#colour").change(function () {

        if ($(this).val() !== '') {

            var theme_csspath = 'css/style.' + $(this).val() + '.css';

            alternateColour.attr("href", theme_csspath);

            $.cookie("theme_csspath", theme_csspath, { expires: 365, path: document.URL.substr(0, document.URL.lastIndexOf('/')) });

        }

        return false;
    });

});

//////////////
// bY FSWS //
/////////////
activeClass();
activeClassDropDown();

function activeClass() {
    var url = window.location.href;
    var element = $('#side-main-menu li a').filter(function() {
        return this.href == url;
    }).parent().addClass('active');
    var element = $('#side-admin-menu li a').filter(function() {
        return this.href == url;
    }).parent().addClass('active');
}

function activeClassDropDown() {
    var docterElement = $('#doctorDropdownDropdown li').hasClass('active');
    var folderElement = $('#folderDropdownDropdown li').hasClass('active');
    var fileElement = $('#fileDropdownDropdown li').hasClass('active');
    if (docterElement) {
        $('#doctorDropdownDropdown li').parent().addClass('show');
        $('#doctorDropdownDropdownBtn').attr("aria-expanded","true");
        $('#doctorDropdownDropdownBtn').removeClass('collapsed');
    }
    if (folderElement) {
        $('#folderDropdownDropdown li').parent().addClass('show');
        $('#folderDropdownDropdownBtn').attr("aria-expanded","true");
        $('#folderDropdownDropdownBtn').removeClass('collapsed');
    }
    if (fileElement) {
        $('#fileDropdownDropdown li').parent().addClass('show');
        $('#fileDropdownDropdownBtn').attr("aria-expanded","true");
        $('#fileDropdownDropdownBtn').removeClass('collapsed');
    }
}