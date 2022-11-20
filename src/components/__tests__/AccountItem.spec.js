import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";

import AccountItem from "../AccountItem.vue";

describe("AccountItem", () => {
	it("renders properly", () => {
		const wrapper = mount(AccountItem, {
			props: { 
				index: 0,
				account: {
					displayName: "Test Account",
					host: "localhost",
					username: "test",
					password: "1234",
					port: 22,
					authType: {
						name: "Password",
						value: "password"
					}
				}
			}
		})

		expect(wrapper.text()).toContain("Test Account")
		expect(wrapper.text()).toContain("Password Authentication")
		expect(wrapper.text()).toContain("test@localhost:22")
	});
});
