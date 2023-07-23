import { exampleKVStoreTestWrapper } from "./wrapper.js";
import { assertEquals } from "$std/assert/assert_equals.ts";
import { assert } from "$std/assert/assert.ts";
import { Status } from "$std/http/http_status.ts";
import { wrapFetch } from "cookiejar";

const fetch = wrapFetch();

const BASE_URL = "http://localhost:8000";

Deno.env.set("APP_KEY", "something_for_testing");

Deno.test(
  "Route Testing",
  {
    sanitizeResources: false,
    sanitizeOps: false,
  },
  exampleKVStoreTestWrapper(async (t) => {
    await t.step("The index page should work", async () => {
      const response = await fetch(`${BASE_URL}`);
      assertEquals(response.status, Status.OK);
      const text = await response.text();
      assert(text.includes("<div>Flash Message: </div>"));
      // console.log(text);
    });

    const SESSION_TEXT = "This is some _Session Text_";
    await t.step(
      "Post index page with 'new_session_text_value' form data.",
      async () => {
        const form_data = new FormData();
        form_data.append("new_session_text_value", SESSION_TEXT);
        const response = await fetch(`${BASE_URL}`, {
          method: "POST",
          body: form_data,
        });
        const text = await response.text();
        // console.log(text);
        assert(
          text.includes("<div>Flash Message: Session value update!</div>"),
        );
        assert(text.includes(`<div>Session Value: $${SESSION_TEXT}</div>`));
        assertEquals(response.status, Status.OK);
      },
    );

    await t.step("Visit again to verify session value", async () => {
      const response = await fetch(`${BASE_URL}`);
      const text = await response.text();
      assert(
        text.includes("<div>Flash Message: </div>"),
      );
      assert(text.includes(`<div>Session Value: $${SESSION_TEXT}</div>`));
      assertEquals(response.status, Status.OK);
    });

    await t.step("The 404 page should 404", async () => {
      const response = await fetch(`${BASE_URL}/404`);
      assertEquals(response.status, Status.NotFound);
    });
  }),
);
