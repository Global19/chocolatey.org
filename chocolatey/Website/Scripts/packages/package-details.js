// Prism for Description section
$(function () {
    // Description Area
    $('#description').find("pre").addClass('line-numbers border').wrapInner('<code class="language-powershell"></code>');
    Prism.highlightAll();

    $(".comments-list").each(function () {
        var commentList = $(this);

        commentList.find("h4:contains('(maintainer)')").addClass('comment-title comment-maintainer');
        commentList.find("h4:contains('(reviewer)')").addClass('comment-title comment-reviewer');
        commentList.children().not('.comment-title').addClass("comment-body");

        commentList.find(".comment-title").each(function () {
            var h4 = $(this),
                text = h4.text(),
                textParts = text.split(' on');

            // Wrap comment in span to form bubble
            h4.nextUntil('.comment-title').addBack().wrapAll('<span class="comment-group"></span>');
            // Disect date and wrap
            if (textParts.length == 2) {
                h4.text(textParts[0]).after('<h6 class="comment-date">on ' + textParts[1] + '</h6>');
            }
        });

        // Define left or right chat position
        var commentMaintainer = commentList.find(".comment-maintainer").parent();
        var commentReviewer = commentList.find(".comment-reviewer").parent();

        if (commentList.hasClass("user-unknown")) {
            commentMaintainer.addClass("chat-left");
            commentReviewer.addClass("chat-right");
        }
        if (commentList.hasClass("user-maintainer")) {
            commentMaintainer.addClass("chat-right");
            commentReviewer.addClass("chat-left");
        }
        if (commentList.hasClass("user-moderator")) {
            commentMaintainer.addClass("chat-left");
            commentReviewer.addClass("chat-right");
        }

        // Scroll to bottom of container to show newest comments first
        commentList.parent().scrollTop(commentList.parent()[0].scrollHeight - commentList.parent()[0].clientHeight);
    });

    // Files Section
    // Expand or Show all files
    $('#files .btn-danger').click(function () {
        var $this = $(this);
        $this.toggleClass('btn-success');
        if ($this.hasClass('btn-success')) {
            $this.html('<i class="fas fa-plus-circle" alt="Show Files"></i> Expand All');
            $this.removeClass('btn-danger');
            $(".collapse-2-content").removeClass('d-block').addClass('d-none').find("pre").children().removeClass().children().removeClass().children().removeClass();
            var $this = $('#files .btn:contains("Hide")');
            $this.html('Show');
        } else {
            $this.html('<i class="fas fa-minus-circle" alt="Collapse Files"></i> Collapse Files');
            $this.removeClass('btn-success').addClass('btn-danger');
            $(".collapse-2-content").removeClass('d-none').addClass('d-block').find("pre").addClass('line-numbers language-powershell').find("code").addClass('language-powershell');
            var $this = $('#files .btn:contains("Show")');
            $this.html('Hide');
        }
    });

    // Approved packages
    $('.collapse-2 .btn').click(function () {
        var $this = $(this).nextAll(".collapse-2-content");
        $this.toggleClass('d-none');
        if ($this.hasClass('d-none')) {
            $this.removeClass('d-block').find("pre").children().removeClass().children().removeClass().children().removeClass();
        } else {
            $this.removeClass('d-none').addClass('d-block').find("pre").addClass('line-numbers language-powershell').find("code").addClass('language-powershell');
            Prism.highlightAll();
        }
    });

    // If expanded for moderation
    var $files = $('.moderation-view .collapse-2');
    var $expand = $(".moderation-view .collapse-2:contains('.nuspec'), .moderation-view .collapse-2:contains('chocolateyinstall.ps1'), .moderation-view .collapse-2:contains('chocolateyuninstall.ps1'), .moderation-view .collapse-2:contains('chocolateybeforemodify.ps1'), .moderation-view .collapse-2:contains('verification.txt'), .moderation-view .collapse-2:contains('license.txt')");

    // Expand Files 
    if ($files.length <= 9) {
        $('.moderation-view .collapse-2-content').addClass('d-block').removeClass('d-none');
        $('.moderation-view .collapse-2-content.d-block').find("pre").addClass('line-numbers language-powershell').find("code").addClass('language-powershell');
        Prism.highlightAll();
    }
    // Collapse Files
    else if ($files.length >= 10) {
        $('.moderation-view .collapse-2-content').removeClass('d-block').addClass('d-none');
        $('.moderation-view .collapse-2 .btn').html('Show');

        if ($files.length > 30) {
            $('.moderation-view .btn-danger').addClass('d-none');
        } else {
            // Show "Expand All" button
            $('.moderation-view .btn-danger').addClass('btn-success').removeClass('btn-danger').html('<i class="fas fa-plus-circle" alt="Show Files"></i> Expand All');
            $('.moderation-view .btn-success').click(function () {
                Prism.highlightAll();
            });
        }
    }
    // Expand Specified Files 
    if ($expand) {
        $expand.addClass('always-expand');
        $expand.find('.collapse-2-content').addClass('d-block').removeClass('d-none').find("pre").addClass('line-numbers language-powershell').find("code").addClass('language-powershell');
        $expand.find('.btn').html('Hide');
        Prism.highlightAll();
    }

    // Installation Tabs
    $("code:contains('STEP 3 URL')").html(function (_, html) {
        $(this).parent().next().remove();
        return html.replace(/(STEP 3 URL)/g, '<span class="stepThreeUrl">$1</span>');
    });
    $('[id*="stepThreeUrl"]').keyup(function () {
        var value = $(this).val();
        var defaultUrl = "http://internal/odata/repo";

        $('.stepThreeUrl').text(value);
        if (value == 0) {
            $('.stepThreeUrl').text(defaultUrl);
            $('.stepThree .tab-pane').prepend('<p class="step-three-danger text-danger font-weight-bold small">You must enter your internal repository url in Step 3 before proceeding.</p>');
            $('#install-step4 .code-toolbar').prepend('<p class="step-three-danger text-danger font-weight-bold small">You must enter your internal repository url in Step 3 before proceeding.</p>');
        }
        else {
            $('.step-three-danger').remove();
        }
    }).keyup();
});