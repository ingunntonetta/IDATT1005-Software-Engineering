import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import app from "../index";
import prismaMock from "../services/__mocks__/prisma";
import testUtils from "./utils";

vi.mock("../services/prisma");

describe("/households/join endpoint", () => {
    it("Should be possible to join a household", () => {
        testUtils.authenticate();

        prismaMock.household.findFirst.mockResolvedValue({
            id: "607c5be6-d4cf-4bb3-8642-96db6252a1fb",
            createdAt: new Date(),
            joinCode: "WGD83HD8",
            name: "Test Household"
        });
        prismaMock.user.count.mockResolvedValue(1);
        prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock))

        return request(app)
            .post("/api/v1/households/join")
            .set("Cookie", testUtils.validCookie)
            .send({ joinCode: "WGD83HD8" })
            .expect(200)
            .expect({ message: "Successfully joined household" });
    });

    it("Should not be possible to join a household with an invalid join code", () => {
        testUtils.authenticate();

        prismaMock.household.findFirst.mockResolvedValue(null);
        prismaMock.user.count.mockResolvedValue(1);
        prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock))

        return request(app)
            .post("/api/v1/households/join")
            .set("Cookie", testUtils.validCookie)
            .send({ joinCode: "AAAAAAAA" })
            .expect(400)
            .expect({ error: "Invalid join code" });
    });
});

describe("/households/leave endpoint", () => {
    it("Should be possible to leave a household", () => {
        testUtils.authenticate();

        prismaMock.user.count.mockResolvedValue(0);
        prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock))

        return request(app)
            .post("/api/v1/households/leave")
            .set("Cookie", testUtils.validCookie)
            .expect(200)
            .expect({ message: "Successfully left household" });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        prismaMock.user.count.mockRejectedValue(new Error("Something went wrong"));
        prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock))

        return request(app)
            .post("/api/v1/households/leave")
            .set("Cookie", testUtils.validCookie)
            .expect(500)
            .expect({ error: "Something went wrong" });
    });
});

describe("/households/members endpoint", () => {
    it("Should return a list of household members", () => {
        testUtils.authenticate();

        const members = [
            { firstName: "First", lastName: "Last", avatarUrl: "" },
            { firstName: "John", lastName: "Doe", avatarUrl: "https://example.com" }
        ];

        // @ts-ignore
        prismaMock.user.findMany.mockResolvedValue(members);

        return request(app)
            .get("/api/v1/households/members")
            .set("Cookie", testUtils.validCookie)
            .expect(200)
            .expect((res) => {
                expect(res.body.data).toEqual(members);
            })
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        prismaMock.user.findMany.mockRejectedValue(new Error("Something went wrong"));

        return request(app)
            .get("/api/v1/households/members")
            .set("Cookie", testUtils.validCookie)
            .expect(500)
            .expect({ error: "Something went wrong" });
    });
});

describe("/households/edit endpoint", () => {
    it("Should be possible to edit the name", () => {
        testUtils.authenticate();

        // @ts-ignore
        prismaMock.household.update.mockResolvedValue({ id: "607c5be6-d4cf-4bb3-8642-96db6252a1fb", name: "New Name" });

        return request(app)
            .put("/api/v1/households/edit")
            .set("Cookie", testUtils.validCookie)
            .send({ name: "New Name" })
            .expect(200)
            .expect({ message: "Successfully updated household name" });
    });

    it("Should handle errors correctly", () => {
        testUtils.authenticate();

        prismaMock.household.update.mockRejectedValue(new Error("Something went wrong"));

        return request(app)
            .put("/api/v1/households/edit")
            .set("Cookie", testUtils.validCookie)
            .send({ name: "New Name" })
            .expect(500)
            .expect({ error: "Something went wrong" });
    });
});