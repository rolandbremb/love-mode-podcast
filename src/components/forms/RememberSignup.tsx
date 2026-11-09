"use client";

import { useEffect } from "react";
import { rememberSignup } from "./QuickSignupForm";

// Someone who confirmed their email in this browser shouldn't see the newsletter pop-up
export default function RememberSignup() {
  useEffect(rememberSignup, []);
  return null;
}
