import React from "react";
// Import the original mapper
import MDXComponents from "@theme-original/MDXComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import the FontAwesomeIcon component.
import { library } from "@fortawesome/fontawesome-svg-core"; // Import the library component.
import { fab } from "@fortawesome/free-brands-svg-icons"; // Import all brands icons.
import { fas } from "@fortawesome/free-solid-svg-icons"; // Import all solid icons.
import { Event } from "react-trivial-timeline";
import Timeline from "./TimelineComponent";
import TextColor from "@site/src/components/TextColor";
import BackgroundColor from "@site/src/components/BackgroundColor";


library.add(fab, fas); // Add all icons to the library so you can use them without importing them individually.

export default {
  // Re-use the default mapping
  ...MDXComponents,
  TextColor, // Make the TextColor component available in MDX as <TextColor />.
  BackgroundColor, // Make the BackgroundColor component available in MDX as <BackgroundColor />.
  icon: FontAwesomeIcon, // Make the FontAwesomeIcon component available in MDX as <icon />.
  timeline: Timeline,
  event: Event
};
