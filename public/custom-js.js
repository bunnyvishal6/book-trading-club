$("#popup1").dialog({
  autoOpen: false,
  modal: true, /*This modal option is for disabling the user from accessing underlying webpage */
  draggable: true,
  height: 310,
  width: 330,
  closeOnEscape: false,
  show: {
    effect: "slideDown",
    duration: 1000,
  },
  position: {
    my: "center",
    at: "center",
    of: window
  },
  hide: {
    effect: "slideUp",
    duration: 1000
  }
});

$("#addNewBook, #newBookAdd").click(function () {
    $("#popup1").dialog("open");
});

$("#poup1Close").click(function(){
    $("#popup1").dialog("close");
});

// Post to the provided URL with the specified parameters.
function post(path, parameters) {
    console.log(parameters);
    var form = $('<form></form>');

    form.attr("method", "post");
    form.attr("action", path);

    $.each(parameters, function(key, value) {
        var field = $('<input></input>');

        field.attr("type", "hidden");
        field.attr("name", key);
        field.attr("value", value);

        form.append(field);
    });

    // The form needs to be a part of the document in
    // order for us to be able to submit it.
    $(document.body).append(form);
    form.submit();
}


