/**
 * scripts/test-api.ts
 * ────────────────────
 * Test suite for Balaji Dry Cleaners API routes:
 * - GET /api/services
 * - POST /api/inquiries (valid, invalid, honeypot spam, rate limit spam, turnstile failure)
 * - POST /api/bookings (valid, invalid, honeypot spam, rate limit spam, turnstile failure)
 *
 * Run via: npx tsx scripts/test-api.ts
 */

import { NextRequest } from "next/server";
import { GET as getServices } from "../src/app/api/services/route";
import { POST as postInquiries } from "../src/app/api/inquiries/route";
import { POST as postBookings } from "../src/app/api/bookings/route";
import { GET as getWork } from "../src/app/api/work/route";
import {
  GET as getAdminWork,
  POST as postAdminWork,
  PUT as putAdminWork,
  DELETE as deleteAdminWork,
} from "../src/app/api/admin/work/route";
import { resetMemoryRateLimit } from "../src/lib/rateLimit";

(process.env as Record<string, string | undefined>).NODE_ENV = "test";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${testName}${details ? ` -> ${details}` : ""}`);
  }
}

function getFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function runTests() {
  console.log("=================================================");
  console.log("   🧪 BALAJI DRY CLEANERS API ROUTES TEST SUITE   ");
  console.log("=================================================\n");

  // ────────────────────────────────────────────────────────
  // 1. GET /api/services
  // ────────────────────────────────────────────────────────
  console.log("── 1. GET /api/services ──");
  {
    const res = await getServices();
    const json = await res.json();

    assert(res.status === 200, "Status is 200");
    assert(json.ok === true, "Response has ok: true");
    assert(Array.isArray(json.data), "Response data is an array");
    assert(json.data.length === 6, `Returns 6 services (got ${json.data?.length})`);
    assert(
      json.data[0]?.id === "suit-blazer-sherwani",
      "First service matches suit-blazer-sherwani"
    );
  }

  // ────────────────────────────────────────────────────────
  // 2. POST /api/inquiries
  // ────────────────────────────────────────────────────────
  console.log("\n── 2. POST /api/inquiries ──");

  // 2.1 Valid payload
  {
    resetMemoryRateLimit();
    const req = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "10.0.0.1",
      },
      body: JSON.stringify({
        name: "Rahul Sharma",
        phone: "9876543210",
        message: "Mujhe suit aur sherwani dry clean karwani hai.",
        turnstileToken: "dummy-test-token",
        honeypot: "",
      }),
    });

    const res = await postInquiries(req);
    const json = await res.json();

    assert(res.status === 201, "Valid inquiry returns status 201");
    assert(json.ok === true, "Valid inquiry has ok: true");
    assert(typeof json.data?.id === "string", "Valid inquiry returns an id");
    assert(
      typeof json.data?.message === "string",
      "Valid inquiry returns friendly Hinglish message"
    );
  }

  // 2.2 Valid phone normalisation (+91 prefix, spaces, dashes)
  {
    const req = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "10.0.0.2",
      },
      body: JSON.stringify({
        name: "Vikram Rathore",
        phone: "+91 98290-12345",
        message: "Blazer press chahiye",
        turnstileToken: "dummy-test-token",
      }),
    });

    const res = await postInquiries(req);
    const json = await res.json();
    assert(
      res.status === 201 && json.ok === true,
      "Phone with +91, spaces and dash normalises and succeeds"
    );
  }

  // 2.3 Invalid: Name too short
  {
    const req = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "10.0.0.3",
      },
      body: JSON.stringify({
        name: "A",
        phone: "9876543210",
        turnstileToken: "dummy-test-token",
      }),
    });

    const res = await postInquiries(req);
    const json = await res.json();

    assert(res.status === 422, "Short name returns status 422");
    assert(json.ok === false, "Short name returns ok: false");
    assert(
      json.error?.code === "VALIDATION_ERROR",
      "Short name error code is VALIDATION_ERROR"
    );
    assert(
      json.error?.message.includes("Naam kam se kam 2 akshar"),
      "Short name message is in Hinglish"
    );
  }

  // 2.4 Invalid: Invalid phone number
  {
    const req = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "10.0.0.4",
      },
      body: JSON.stringify({
        name: "Rahul Sharma",
        phone: "123456",
        turnstileToken: "dummy-test-token",
      }),
    });

    const res = await postInquiries(req);
    const json = await res.json();

    assert(res.status === 422, "Invalid phone returns status 422");
    assert(
      json.error?.message.toLowerCase().includes("phone"),
      "Invalid phone returns phone validation error"
    );
  }

  // 2.5 Invalid: Missing turnstile token
  {
    const req = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "10.0.0.5",
      },
      body: JSON.stringify({
        name: "Rahul Sharma",
        phone: "9876543210",
        turnstileToken: "",
      }),
    });

    const res = await postInquiries(req);
    const json = await res.json();

    assert(res.status === 422, "Missing Turnstile token returns status 422");
  }

  // 2.6 Failed Turnstile verification
  {
    const req = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "10.0.0.6",
      },
      body: JSON.stringify({
        name: "Rahul Sharma",
        phone: "9876543210",
        turnstileToken: "invalid-turnstile-token",
      }),
    });

    const res = await postInquiries(req);
    const json = await res.json();

    assert(res.status === 403, "Failed Turnstile returns status 403");
    assert(
      json.error?.code === "TURNSTILE_FAILED",
      "Failed Turnstile error code is TURNSTILE_FAILED"
    );
    assert(
      json.error?.message.includes("Bot verification"),
      "Turnstile error message is in Hinglish"
    );
  }

  // 2.7 Honeypot spam (silent 200)
  {
    const req = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "10.0.0.7",
      },
      body: JSON.stringify({
        name: "Spam Bot",
        phone: "9876543210",
        message: "Visit spam.com",
        turnstileToken: "dummy-test-token",
        honeypot: "https://spammer.example.com",
      }),
    });

    const res = await postInquiries(req);
    const json = await res.json();

    assert(res.status === 200, "Honeypot filled returns status 200 silently");
    assert(json.ok === true, "Honeypot filled has ok: true");
    assert(json.data?.received === true, "Honeypot returns { received: true }");
  }

  // 2.8 Rate limit spam (5 allowed, 6th blocked)
  {
    resetMemoryRateLimit();
    const spamIp = "192.168.10.99";
    const results: number[] = [];

    for (let i = 0; i < 6; i++) {
      const req = new NextRequest("http://localhost:3000/api/inquiries", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": spamIp,
        },
        body: JSON.stringify({
          name: "Repeat User",
          phone: "9876543210",
          turnstileToken: "dummy-test-token",
        }),
      });
      const res = await postInquiries(req);
      results.push(res.status);
    }

    const firstFiveOk = results.slice(0, 5).every((s) => s === 201);
    const sixthBlocked = results[5] === 429;

    assert(firstFiveOk, "First 5 requests succeed with 201");
    assert(sixthBlocked, "6th request from same IP is blocked with 429 RATE_LIMIT");
  }

  // ────────────────────────────────────────────────────────
  // 3. POST /api/bookings
  // ────────────────────────────────────────────────────────
  console.log("\n── 3. POST /api/bookings ──");

  // 3.1 Valid booking
  {
    resetMemoryRateLimit();
    const req = new NextRequest("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "172.16.0.1",
      },
      body: JSON.stringify({
        name: "Pooja Verma",
        phone: "9829098290",
        service: "saree-lehenga-ghagra",
        pickupSlot: "shaam",
        pickupDate: getFutureDate(2),
        address: "Plot 45, Near Maheshwari Bhawan, RK Colony, Bhilwara",
        notes: "Heavy zari work hai, dhyan se",
        turnstileToken: "dummy-test-token",
      }),
    });

    const res = await postBookings(req);
    const json = await res.json();

    assert(res.status === 201, "Valid booking returns status 201");
    assert(json.ok === true, "Valid booking has ok: true");
    assert(
      typeof json.data?.bookingCode === "string" &&
        json.data.bookingCode.startsWith("BDC-"),
      `Valid booking returns bookingCode starting with BDC- (got ${json.data?.bookingCode})`
    );
  }

  // 3.2 Invalid: Invalid service choice
  {
    const req = new NextRequest("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "172.16.0.2",
      },
      body: JSON.stringify({
        name: "Pooja Verma",
        phone: "9829098290",
        service: "spaceship-wash",
        pickupSlot: "subah",
        pickupDate: getFutureDate(2),
        address: "Plot 45, Near Maheshwari Bhawan, RK Colony, Bhilwara",
        turnstileToken: "dummy-test-token",
      }),
    });

    const res = await postBookings(req);
    const json = await res.json();

    assert(res.status === 422, "Invalid service returns status 422");
    assert(
      json.error?.message.includes("service select karein"),
      "Invalid service error message is in Hinglish"
    );
  }

  // 3.3 Invalid: Invalid pickup slot
  {
    const req = new NextRequest("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "172.16.0.3",
      },
      body: JSON.stringify({
        name: "Pooja Verma",
        phone: "9829098290",
        service: "daily-wash-iron",
        pickupSlot: "midnight",
        pickupDate: getFutureDate(2),
        address: "Plot 45, Near Maheshwari Bhawan, RK Colony, Bhilwara",
        turnstileToken: "dummy-test-token",
      }),
    });

    const res = await postBookings(req);
    const json = await res.json();

    assert(res.status === 422, "Invalid pickupSlot returns status 422");
    assert(
      json.error?.message.includes("Pickup time"),
      "Invalid pickupSlot message is in Hinglish"
    );
  }

  // 3.4 Invalid: Past date
  {
    const req = new NextRequest("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "172.16.0.4",
      },
      body: JSON.stringify({
        name: "Pooja Verma",
        phone: "9829098290",
        service: "daily-wash-iron",
        pickupSlot: "subah",
        pickupDate: "2020-01-01",
        address: "Plot 45, Near Maheshwari Bhawan, RK Colony, Bhilwara",
        turnstileToken: "dummy-test-token",
      }),
    });

    const res = await postBookings(req);
    const json = await res.json();

    assert(res.status === 422, "Past date returns status 422");
    assert(
      json.error?.message.includes("Pickup date"),
      "Past date error message mentions Pickup date"
    );
  }

  // 3.5 Invalid: Date > 30 days away
  {
    const req = new NextRequest("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "172.16.0.5",
      },
      body: JSON.stringify({
        name: "Pooja Verma",
        phone: "9829098290",
        service: "daily-wash-iron",
        pickupSlot: "subah",
        pickupDate: getFutureDate(45),
        address: "Plot 45, Near Maheshwari Bhawan, RK Colony, Bhilwara",
        turnstileToken: "dummy-test-token",
      }),
    });

    const res = await postBookings(req);
    const json = await res.json();

    assert(res.status === 422, "Date > 30 days away returns status 422");
  }

  // 3.6 Invalid: Address too short (< 10 chars)
  {
    const req = new NextRequest("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "172.16.0.6",
      },
      body: JSON.stringify({
        name: "Pooja Verma",
        phone: "9829098290",
        service: "daily-wash-iron",
        pickupSlot: "subah",
        pickupDate: getFutureDate(2),
        address: "Ghar",
        turnstileToken: "dummy-test-token",
      }),
    });

    const res = await postBookings(req);
    const json = await res.json();

    assert(res.status === 422, "Short address returns status 422");
    assert(
      json.error?.message.includes("Address kam se kam 10"),
      "Short address error message is in Hinglish"
    );
  }

  // 3.7 Honeypot spam on booking (silent 200)
  {
    const req = new NextRequest("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "172.16.0.7",
      },
      body: JSON.stringify({
        name: "Booking Bot",
        phone: "9829098290",
        service: "daily-wash-iron",
        pickupSlot: "subah",
        pickupDate: getFutureDate(2),
        address: "Plot 45, Near Maheshwari Bhawan, RK Colony, Bhilwara",
        turnstileToken: "dummy-test-token",
        honeypot: "https://casino.example.com",
      }),
    });

    const res = await postBookings(req);
    const json = await res.json();

    assert(res.status === 200, "Booking with honeypot returns status 200 silently");
    assert(json.ok === true && json.data?.received === true, "Booking honeypot returns { received: true }");
  }

  // 3.8 Rate limit spam on booking (5 allowed, 6th blocked)
  {
    resetMemoryRateLimit();
    const spamIp = "192.168.20.77";
    const results: number[] = [];

    for (let i = 0; i < 6; i++) {
      const req = new NextRequest("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": spamIp,
        },
        body: JSON.stringify({
          name: "Repeat Booker",
          phone: "9829098290",
          service: "daily-wash-iron",
          pickupSlot: "subah",
          pickupDate: getFutureDate(2),
          address: "Plot 45, Near Maheshwari Bhawan, RK Colony, Bhilwara",
          turnstileToken: "dummy-test-token",
        }),
      });
      const res = await postBookings(req);
      results.push(res.status);
    }

    const firstFiveOk = results.slice(0, 5).every((s) => s === 201);
    const sixthBlocked = results[5] === 429;

    assert(firstFiveOk, "First 5 booking requests succeed with 201");
    assert(sixthBlocked, "6th booking request from same IP is blocked with 429 RATE_LIMIT");
  }

  // ────────────────────────────────────────────────────────
  // 4. Notifications & Templates
  // ────────────────────────────────────────────────────────
  console.log("\n── 4. Notifications & Templates ──");

  // 4.1 Owner booking email template
  {
    const { renderOwnerBookingEmail } = await import("../src/lib/notify/emailTemplates");
    const { subject, html } = renderOwnerBookingEmail({
      bookingCode: "BDC-0042",
      name: "Suresh Gupta",
      phone: "+919829012345",
      service: "suit-blazer-sherwani",
      serviceTitle: "Suit / Blazer / Sherwani",
      pickupSlot: "subah",
      pickupDate: "2026-10-25",
      address: "12, Patel Nagar, Bhilwara",
      notes: "Please steam press only",
      customerEmail: "suresh@example.com",
    });

    assert(subject.includes("BDC-0042"), "Owner email subject contains booking code");
    assert(subject.includes("Suresh Gupta"), "Owner email subject contains customer name");
    assert(html.includes("BDC-0042"), "Owner email HTML contains booking code badge");
    assert(html.includes("tel:+919829012345"), "Owner email HTML contains tap-to-call link");
    assert(html.includes("wa.me/919829012345"), "Owner email HTML contains WhatsApp reply button link");
    assert(html.includes("Please steam press only"), "Owner email HTML contains customer notes");
  }

  // 4.2 Customer confirmation email template
  {
    const { renderCustomerConfirmationEmail } = await import("../src/lib/notify/emailTemplates");
    const { subject, html } = renderCustomerConfirmationEmail({
      bookingCode: "BDC-0099",
      name: "Meena Sharma",
      serviceTitle: "Saree / Lehenga / Ghagra Choli",
      pickupSlot: "shaam",
      pickupDate: "2026-10-26",
      address: "Shop 4, Azad Market, Bhilwara",
    });

    assert(subject.includes("BDC-0099"), "Customer email subject contains booking code");
    assert(html.includes("BDC-0099"), "Customer email HTML has reference badge");
    assert(html.includes("Meena Sharma"), "Customer email HTML greets customer by name");
    assert(html.includes("Saree / Lehenga"), "Customer email HTML contains service title");
  }

  // 4.3 Notification dispatch resilience (never throws)
  {
    const { notifyNewBooking, notifyNewInquiry } = await import("../src/lib/notify");

    let bookingDispatchPassed = false;
    try {
      await notifyNewBooking({
        bookingCode: "BDC-0001",
        name: "Test User",
        phone: "+919999999999",
        service: "daily-wash-iron",
        pickupSlot: "subah",
        pickupDate: "2026-10-22",
        address: "Test Address, Bhilwara",
        email: "customer@test.com",
      });
      bookingDispatchPassed = true;
    } catch {
      bookingDispatchPassed = false;
    }
    assert(bookingDispatchPassed, "notifyNewBooking executes safely without throwing");

    let inquiryDispatchPassed = false;
    try {
      await notifyNewInquiry({
        name: "Test Lead",
        phone: "+919999999999",
        message: "Need dry clean quote",
        email: "lead@test.com",
      });
      inquiryDispatchPassed = true;
    } catch {
      inquiryDispatchPassed = false;
    }
    assert(inquiryDispatchPassed, "notifyNewInquiry executes safely without throwing");
  }

  // ────────────────────────────────────────────────────────
  // 5. WORK SHOWCASE (GET /api/work & /api/admin/work)
  // ────────────────────────────────────────────────────────
  console.log("\n── 5. Work Showcase APIs ──");
  {
    // 5.1 Public GET /api/work
    const publicRes = await getWork();
    const publicJson = await publicRes.json();
    assert(publicRes.status === 200, "Public GET /api/work returns 200");
    assert(publicJson.ok === true, "Public GET /api/work has ok: true");
    assert(Array.isArray(publicJson.data), "Public GET /api/work returns an array");
    assert(publicJson.data.length >= 1, `Public GET returns at least 1 work item (got ${publicJson.data.length})`);

    // 5.2 Admin GET /api/admin/work
    const adminGetReq = new NextRequest("http://localhost:3000/api/admin/work", {
      headers: { Authorization: "Bearer dev-admin-token" },
    });
    const adminGetRes = await getAdminWork(adminGetReq);
    const adminGetJson = await adminGetRes.json();
    assert(adminGetRes.status === 200, "Admin GET /api/admin/work returns 200");
    assert(adminGetJson.ok === true, "Admin GET /api/admin/work has ok: true");
    assert(Array.isArray(adminGetJson.data.items), "Admin items is an array");
    assert(typeof adminGetJson.data.stats === "object", "Admin stats object is present");

    // 5.3 Admin POST /api/admin/work (Create)
    const newWorkReq = new NextRequest("http://localhost:3000/api/admin/work", {
      method: "POST",
      headers: {
        Authorization: "Bearer dev-admin-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Test Sherwani Steam Press",
        category: "Wedding Wear",
        description: "Delicate dry cleaning test with steam press.",
        after_image: "https://images.unsplash.com/photo-test-after.jpg",
        before_image: "https://images.unsplash.com/photo-test-before.jpg",
        tag_text: "100% Crisp Finish",
        is_featured: true,
        is_active: true,
      }),
    });
    const createRes = await postAdminWork(newWorkReq);
    const createJson = await createRes.json();
    assert(createRes.status === 201, "Admin POST /api/admin/work returns 201");
    assert(createJson.ok === true, "Admin POST returns ok: true");
    assert(createJson.data.title === "Test Sherwani Steam Press", "Created title matches");
    const createdId = createJson.data.id;

    // 5.4 Admin PUT /api/admin/work (Update)
    const updateReq = new NextRequest("http://localhost:3000/api/admin/work", {
      method: "PUT",
      headers: {
        Authorization: "Bearer dev-admin-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: createdId,
        title: "Updated Test Sherwani Steam Press",
        is_active: false,
      }),
    });
    const updateRes = await putAdminWork(updateReq);
    const updateJson = await updateRes.json();
    assert(updateRes.status === 200, "Admin PUT /api/admin/work returns 200");
    assert(updateJson.data.is_active === false, "Updated is_active is false");

    // 5.5 Admin DELETE /api/admin/work (Delete)
    const deleteReq = new NextRequest(`http://localhost:3000/api/admin/work?id=${createdId}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer dev-admin-token" },
    });
    const deleteRes = await deleteAdminWork(deleteReq);
    const deleteJson = await deleteRes.json();
    assert(deleteRes.status === 200, "Admin DELETE /api/admin/work returns 200");
    assert(deleteJson.ok === true, "Admin DELETE has ok: true");
  }

  console.log("\n=================================================");
  console.log(`   TEST RESULTS: ${passedTests}/${totalTests} PASSED   `);
  if (failedTests > 0) {
    console.error(`   ⚠️ ${failedTests} TESTS FAILED!`);
    process.exit(1);
  } else {
    console.log("   🎉 ALL TESTS PASSED SUCCESSFULLY!");
    console.log("=================================================\n");
  }
}

runTests().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
