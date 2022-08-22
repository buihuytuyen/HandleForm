function Validator(options) {

    function getParent(element, selector) {
        while( element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    var selectorRule = {}

    function validate (inputElement, rule) {

        var errorElement =  getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage

        // lay ra cac rules cua selector
        var rules = selectorRule[rule.selector]

        // Lap qua tung rule va kiem tra
        // Neu co loi thi dung viec kiem tra
        for(var i = 0; i < rules.length; i++) {
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if(errorMessage) break
        }
        

        if(errorMessage) {

            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')

        } else {
            
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
 
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
                    var formValue = Array.from(enableInputs).reduce(function (values, input){ // Convert form NodeList to Array
                        switch(input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) return values
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }   
                        return  values
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
             
            

            var inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach( function (inputElement) {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                 }
 
                 // Xử lý mỗi kho người dùng nhập
                 inputElement.oninput = function () {
                     var errorElement =  getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                     errorElement.innerText = ''
                     getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
 
                 }
            })
        })
    }
}

Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
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