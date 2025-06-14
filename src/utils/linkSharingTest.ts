// Utility function to test link sharing functionality
// This can be used in the browser console to debug issues

export const testLinkSharing = async () => {
  console.log("Testing link sharing functionality...");

  // Test data
  const testLink = {
    url: "https://example.com",
    title: "Test Link",
    description: "This is a test link",
  };

  console.log("Test link data:", testLink);

  // This would be called from the actual component
  // Just for debugging purposes
  return testLink;
};

// Debug function to check if embed fields exist in the database
export const checkEmbedFieldsSupport = async (supabase: any) => {
  try {
    console.log("Checking if embed fields are supported...");

    // Try to select embed fields
    const { data, error } = await supabase
      .from("shared_links")
      .select("id, embed_type, embed_data")
      .limit(1);

    if (error) {
      console.error("Embed fields not supported:", error);
      return false;
    }

    console.log("Embed fields are supported!", data);
    return true;
  } catch (error) {
    console.error("Error checking embed fields:", error);
    return false;
  }
};
