<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $message = htmlspecialchars($_POST['message']);

    // Your church email here
    $to = "osayandepromise112@gmail.com";  

    $subject = "New Contact Message from $name";
    $body = "Name: $name\nEmail: $email\n\nMessage:\n$message";
    $headers = "From: $email";

    if (mail($to, $subject, $body, $headers)) {
        echo "<span style='color:green;'>✅ Thank you $name, your message has been sent successfully.</span>";
    } else {
        echo "<span style='color:red;'>❌ Sorry, something went wrong. Please try again later.</span>";
    }
}
?>

