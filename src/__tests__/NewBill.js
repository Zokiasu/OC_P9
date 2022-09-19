import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js";

jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee on New Bill Page", () => {
  let newBill
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
    const html = NewBillUI()
    document.body.innerHTML = html
    newBill = new NewBill({
      document,
      onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
      store: mockStore,
      localStorage: window.localStorage
    })
  })

  describe("When I select a file", () => {

    test("it should call handleChangeFile method", () => {
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputFile = screen.getByTestId('file')
      inputFile.addEventListener('change', handleChangeFile)
      fireEvent.change(inputFile, {
        target: {
          files: [new File(['proof.jpg'], 'proof.jpg', {type: 'image/jpg'})]
        }
      })
      expect(handleChangeFile).toHaveBeenCalled()
    })

    describe("Then the file format is valid", () => {
      test('it should update the input field', () => {
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        const inputFile = screen.getByTestId('file')
        inputFile.addEventListener('change', handleChangeFile)
        fireEvent.change(inputFile, {
          target: {
            files: [new File(['proof.jpg'], 'proof.jpg', {type: 'image/jpg'})]
          }
        })
        expect(inputFile.files[0].name).toBe("proof.jpg");
      })
    })

    describe("Then the file format is not valid", () => {
      test('it should not update the input field', () => {
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        const inputFile = screen.getByTestId('file')
        inputFile.addEventListener('change', handleChangeFile)
        fireEvent.change(inputFile, {
          target: {
            files: [new File(['proof.xyz'], 'proof.xyz', {type: 'text/xyz'})]
          }
        })
        expect(handleChangeFile).toHaveReturnedWith(false)
      })
    })
  })

  describe('When I submit the New Bill form', () => {
    test('It should call handleSubmit method', () => {
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const newBillForm = screen.getByTestId('form-new-bill')
      newBillForm.addEventListener('submit', handleSubmit)
      fireEvent.submit(newBillForm)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})

describe("Given I am a user connected as Employee", () => {
  describe("When I create new bill", () => {
    test("send bill to mock API POST", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))

      const root = document.createElement("div");
      root.setAttribute("id", "root")
      document.body.append(root)
      
      router()

      window.onNavigate(ROUTES_PATH.NewBill)

      jest.spyOn(mockStore, "bills")

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: (bill) => {
            return Promise.resolve()
          },
        }
      })

      await new Promise(process.nextTick);
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
    })

    describe("When an error occurs on API", () => {
      test("send bill to mock API POST", async () => {
        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))

        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)

        router()

        window.onNavigate(ROUTES_PATH.NewBill)
        jest.spyOn(mockStore, "bills");

        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: (bill) => {
              return Promise.reject(new Error("Erreur 404"))
            },
          }
        })

        await new Promise(process.nextTick);
        document.body.innerHTML = BillsUI({ error: "Erreur 404" })
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      });

      test("send bill to mock API POST", async () => {
        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))
        const root = document.createElement("div")
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.NewBill)
        jest.spyOn(mockStore, "bills")

        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: (bill) => {
              return Promise.reject(new Error("Erreur 500"))
            },
          }
        })

        await new Promise(process.nextTick);
        const html = BillsUI({ error: "Erreur 500" })
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})