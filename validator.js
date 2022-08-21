function Validator(options) {

    var selectorRule = {}

    function validate (inputElement, rule) {

        var errorElement =  inputElement.parentElement.querySelector(options.errorSelector);
        var errorMessage

        // lay ra cac rules cua selector
        var rules = selectorRule[rule.selector]

        // Lap qua tung rule va kiem tra
        // Neu co loi thi dung viec kiem tra
        for(var i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value)
            if(errorMessage) break
        }
        

        if(errorMessage) {

            errorElement.innerText = errorMessage
            inputElement.parentElement.classList.add('invalid')

        } else {
            
            errorElement.innerText = ''
            inputElement.parentElement.classList.remove('invalid')

        }

        return !errorMessage
    }

    var formElement = document.querySelector(options.form);
    
    if(formElement) {

        formElement.onsubmit = function(e) {
            // Khi submit form
            e.preventDefault() // bo di hanh dong mac dinh

            var isFormValid = true;
            
            // Thuc hien lap qua tung rule va validate
            options.rules.forEach( function (rule){
                var inputElement = formElement.querySelector(rule.selector)

                var isValid = validate(inputElement, rule)
                if(!isValid){
                    isFormValid = false
                }
            })

            if(isFormValid) {
                // Truong hop submit voi javascript
                if(typeof options.onSubmit === 'function'){

                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])') 
                    var formValue = Array.from(enableInputs).reduce(function (value, input){ // Convert form NodeList to Array
                        return (value[input.name] = input.value ) && value
                    }, {})     

                    options.onSubmit(formValue)
                } else {  // submit voi hanh vi mac dinh
                    formElement.submit()
                }
            } 
        }

        // Lap qua moi rule va xu ly (blur, input, ... )
        options.rules.forEach( function (rule) {

            // Luu lai cac rule cho moi input
            if(Array.isArray(selectorRule[rule.selector])) {
                selectorRule[rule.selector].push(rule.test)
            } else {
                selectorRule[rule.selector] = [rule.test]
            }
             
            

            var inputElement = formElement.querySelector(rule.selector)

            if(inputElement) {

                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                   validate(inputElement, rule)
                }

                // Xử lý mỗi kho người dùng nhập
                inputElement.oninput = function () {
                    var errorElement =  inputElement.parentElement.querySelector(options.errorSelector);
                    errorElement.innerText = ''
                    inputElement.parentElement.classList.remove('invalid')

                }

            }
        })
    }
}

Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiếu ${min} ký tự`
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}